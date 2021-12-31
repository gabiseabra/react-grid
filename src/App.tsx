import "./styles.scss"

import pipe from "lodash/fp/pipe"
import { RefObject, useEffect, useMemo, useRef, useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import * as RV from "react-virtualized"

import * as CM from "./components/ContextMenu"
import { Filter } from "./components/Filter"
import { GroupCell } from "./components/GroupCell"
import { HeadingCell } from "./components/HeadingCell"
import { ValueCell } from "./components/ValueCell"
import { adjustScrollToCell } from "./lib/adjustScrollToCell"
import { useApplyFilter, useFilters } from "./lib/hooks/useFilter"
import { isGroup, useGroupBy } from "./lib/hooks/useGroupBy"
import { useOrderBy } from "./lib/hooks/useOrderBy"
import { usePins } from "./lib/hooks/usePins"
import { useSelection } from "./lib/hooks/useSelection"
import { useSize } from "./lib/hooks/useSize"
import {
  mkCellRangeRenderer,
  mkCellRenderer,
  Point,
  rowRange,
  stickyRangeRenderer,
} from "./lib/Range"
import { applyFilter,Columns,compare, Row, Schema, TaggedFilters, Tuple, TypeMap } from "./lib/Schema"

// Very large but not random (takes too long to generate 1M rows)
// Uncomment to test the grid with offset adjustment
// const initialRows: Row[] = Array(1000000).fill(mkRow(0))
// Smaller and random
const initialRows: Row[] = Array(10000).fill(null).map(() => Row(0))

const headingRange = rowRange(0)

const HEADER_HEIGHT = 70

export default function App(): JSX.Element {
  const gridRef: RefObject<RV.Grid> = useRef(null)
  const [rows, setRows] = useState(initialRows)
  const [columns, setColumns] = useState(Columns)

  const filters = useFilters<typeof Schema, TaggedFilters>()
  const filteredRows = useApplyFilter<typeof Schema, TaggedFilters>(rows, filters.filters, applyFilter)
  const pins = usePins(setColumns)
  const orderBy = useOrderBy(setRows, (id, a, b) => compare({
    type: Schema.getCol(id).type,
    a: a[id],
    b: b[id],
  } as Tuple<TypeMap>))
  const groupBy = useGroupBy(filteredRows)
  const selection = useSelection({
    selectableRange: [[0, 1], [columns.length, groupBy.groupedRows.length + 1]],
    scrollToCell: adjustScrollToCell({
      gridRef,
      offset: { columnIndex: pins.pinCount, rowIndex: 1 },
    }),
  })
  const columnWidth = useSize({
    gridRef,
    axis: "x",
    defaultSize: 130,
    getKey: (ix) => columns[ix].id,
  })

  useEffect(() => gridRef.current?.recomputeGridSize(), [columns])

  const cellRenderer = useMemo(() => mkCellRenderer(
    [headingRange, ({ columnIndex: index, style, key }) => {
      const column = columns[index]
      return (
        <div key={key} style={style}>
          <CM.Context
            renderMenu={(ref, style) => (
              <CM.Menu ref={ref} style={style}>
                <Filter
                  column={column}
                  rows={rows}
                  filters={filters}
                />
              </CM.Menu>
            )}
          >
            <HeadingCell
              column={column}
              columnIndex={index}
              isPinned={pins.isPinned(index)}
              isGrouped={groupBy.groupedColumns.includes(column.id)}
              size={{ width: columnWidth.get(index), height: HEADER_HEIGHT }}
              ordering={orderBy.getOrdering(column.id)}
              onChangePinned={(pinned) => pinned ? pins.addPin(index) : pins.removePin(index)}
              onChangeGrouped={(grouped) => grouped ? groupBy.addGroupBy(column.id) : groupBy.removeGroupBy(column.id)}
              onChangeOrdering={(ordering) => ordering ? orderBy.addOrderBy(column.id, ordering) : orderBy.removeOrderBy(column.id)}
              onResize={({ width }) => columnWidth.set(index, width)}
              onDrop={(ix) => pins.insertBefore(ix, index)}
            />
          </CM.Context>
        </div>
      )
    }],
    [x => x, ({ columnIndex, rowIndex, style, key }) => {
      const column = columns[columnIndex]
      const row = groupBy.groupedRows[rowIndex - 1]
      if (isGroup(row)) {
        return (
          <div key={key} style={style} onClick={() => groupBy.setExpanded(row.key, !row.isExpanded)}>
            <GroupCell column={column} rows={row.entries} />
          </div>
        )
      } else {
        const cell = Schema.getCell(column.id, row)
        const coord = Point({ columnIndex, rowIndex })
        return (
          <div key={key} style={style} {...selection.cellEvents(coord)}>
            <ValueCell cell={cell} isFocused={selection.isFocused(coord)} isSelected={selection.isSelected(coord)} />
          </div>
        )
      }
    }]
  ), [
    columns,
    pins.pinCount,
    selection.selection,
    selection.isSelecting,
    groupBy.groupedRows,
    orderBy.orderedBy,
  ])

  const cellRangeRenderer = useMemo(() => mkCellRangeRenderer(
    [pipe(pins.pinnedRange, headingRange), stickyRangeRenderer({
      key: "pinned-heading",
      top: true,
      left: true,
    })],
    [headingRange, stickyRangeRenderer({ key: "heading", top: true })],
    [pins.pinnedRange, stickyRangeRenderer({ key: "pinned", left: true })],
    [x => x, x => x]
  ), [pins.pinCount])

  return (
    <DndProvider backend={HTML5Backend}>
      <RV.AutoSizer>
        {({ width, height }) => (
          <RV.Grid
            ref={gridRef}
            width={width}
            height={height}
            overscanColumnCount={0}
            overscanRowCount={0}
            cellRangeRenderer={cellRangeRenderer}
            cellRenderer={cellRenderer}
            columnCount={columns.length}
            rowCount={groupBy.groupedRows.length + 1}
            columnWidth={({ index }) => columnWidth.get(index)}
            rowHeight={({ index }) => index === 0 ? HEADER_HEIGHT : 30}
          />
        )}
      </RV.AutoSizer>
    </DndProvider>
  )
}
