import "./styles.scss"

import pipe from "lodash/fp/pipe"
import { RefObject, useEffect, useMemo, useRef } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import * as RV from "react-virtualized"

import * as CM from "./components/ContextMenu"
import { Filter } from "./components/Filter"
import { GroupCell } from "./components/GroupCell"
import { HeadingCell } from "./components/HeadingCell"
import { ValueCell } from "./components/ValueCell"
import { adjustScrollToCell } from "./lib/adjustScrollToCell"
import { isGroup } from "./lib/Group"
import { ICol, usePreset } from "./lib/hooks/usePreset"
import { useQuery } from "./lib/hooks/useQuery"
import { useSelection } from "./lib/hooks/useSelection"
import {
  mkCellRangeRenderer,
  mkCellRenderer,
  Point,
  rowRange,
  stickyRangeRenderer,
} from "./lib/Range"
import { emptyQuery, Row, Schema } from "./lib/Schema"
import { mkRow } from "./lib/Schema/gen"

// A very large dataset that would take forever to generate random values for, so
// the following is not random. Uncomment to test the grid with offset adjustment.
// const initialRows: Row[] = Array(1000000).fill(mkRow(0))
const initialRows: Row[] = Array(10000).fill(null).map(() => mkRow(0))

const initialColumns: Map<string, ICol> = new Map(Schema.columnTags.map((id) => [id, {
  ...Schema.getCol(id),
  key: id,
  label: id,
  width: 130,
}]))

const initialPreset = {
  columns: initialColumns,
  query: emptyQuery,
  pinCount: 0,
}

const headingRange = rowRange(0)

const HEADER_HEIGHT = 70

export default function App(): JSX.Element {
  const gridRef: RefObject<RV.Grid> = useRef(null)

  const {
    preset: { columns, pinCount, query },
    getColumnByIndex,
    pinnedRange,
    ...preset
  } = usePreset(initialPreset)

  const res = useQuery({ rows: initialRows, query })

  const selection = useSelection({
    selectableRange: [[0, 1], [columns.size, res.result.length + 1]],
    scrollToCell: adjustScrollToCell({
      gridRef,
      offset: { columnIndex: pinCount, rowIndex: 1 },
    }),
  }, [columns.size, res.result.length])

  useEffect(() => gridRef.current?.recomputeGridSize(), [columns])
  useEffect(() => selection.clearSelection(), [columns.size, res.result.length])

  const cellRenderer = useMemo(() => mkCellRenderer(
    [headingRange, ({ columnIndex: index, style }) => {
      const column = getColumnByIndex(index)
      return (
        <div key={column.key} style={style}>
          <CM.Context
            renderMenu={(ref, style) => (
              <CM.Menu ref={ref} style={style}>
                <CM.SubMenu id="filters" label="Filter">
                  <Filter
                    column={column}
                    rows={initialRows}
                    filters={query.filters}
                    setFilters={preset.setFilters} />
                </CM.SubMenu>
                <CM.Button onClick={preset.cloneColumn(column.key)}>
                  Duplicate
                </CM.Button>
                <CM.Confirm onConfirmed={preset.deleteColumn(column.key)}>
                  {(onClick, state) =>
                    <CM.Button onClick={onClick}>
                      {state === "CONFIRM" ? "Really?" : "Delete"}
                    </CM.Button>
                  }
                </CM.Confirm>
                <CM.SubMenu id="test" label="Testing">
                  <CM.Button onClick={() => console.log("lmao")}>Eyy</CM.Button>
                  <CM.SubMenu id="eyy" label="Eyy">lmao</CM.SubMenu>
                </CM.SubMenu>
              </CM.Menu>
            )}
          >
            <HeadingCell
              label={column.label}
              columnKey={column.key}
              width={column.width}
              height={HEADER_HEIGHT}
              isPinned={preset.isPinned(column.key)}
              sorting={preset.getSorting(column.id)}
              isGrouped={preset.getIsGrouped(column.id)}
              hasFilters={Boolean(preset.getFilter(column.id))}
              onClearFilters={() => preset.setFilter(column.id)(undefined)}
              onChangeGrouped={preset.setIsGrouped(column.id)}
              onChangeSort={preset.setSorting(column.id)}
              onChangePinned={preset.setPinned(column.key)}
              onChangeWidth={preset.setWidth(column.key)}
              onDrop={preset.moveColumn(index)}
            />
          </CM.Context>
        </div>
      )
    }],
    [x => x, ({ columnIndex, rowIndex, style }) => {
      const column = getColumnByIndex(columnIndex)
      const row = res.result[rowIndex - 1]
      if (isGroup(row)) {
        const key = `${column.key}:g:${row.key}`
        const isExpanded = res.isExpanded(row.key)
        return (
          <div key={key} style={style} onClick={() => res.setExpanded(row.key)(!isExpanded)}>
            <GroupCell column={column} rows={row.entries} />
          </div>
        )
      } else {
        const cell = Schema.getCell(column.id, row)
        const coord = Point({ columnIndex, rowIndex })
        const key = `${column.key}:r:${rowIndex}`
        return (
          <div key={key} style={style} {...selection.cellEvents(coord)}>
            <ValueCell cell={cell} isFocused={selection.isFocused(coord)} isSelected={selection.isSelected(coord)} />
          </div>
        )
      }
    }]
  ), [
    pinCount,
    selection.selection,
    selection.isSelecting,
    res.result,
    columns,
    query,
  ])

  const cellRangeRenderer = useMemo(() => mkCellRangeRenderer(
    [pipe(pinnedRange, headingRange), stickyRangeRenderer({
      key: "pinned-heading",
      top: true,
      left: true,
    })],
    [headingRange, stickyRangeRenderer({ key: "heading", top: true })],
    [pinnedRange, stickyRangeRenderer({ key: "pinned", left: true })],
    [x => x, x => x]
  ), [pinCount])

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
            columnCount={columns.size}
            rowCount={res.result.length + 1}
            columnWidth={({ index }) => getColumnByIndex(index).width}
            rowHeight={({ index }) => index === 0 ? HEADER_HEIGHT : 30}
          />
        )}
      </RV.AutoSizer>
    </DndProvider>
  )
}
