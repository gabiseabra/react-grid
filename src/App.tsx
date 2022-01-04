import "./styles.scss"

import pipe from "lodash/fp/pipe"
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import * as RV from "react-virtualized"

import * as CM from "./components/ContextMenu"
import { Filter } from "./components/Filter"
import { GroupCell } from "./components/GroupCell"
import { HeadingCell } from "./components/HeadingCell"
import { ValueCell } from "./components/ValueCell"
import { adjustScrollToCell } from "./lib/adjustScrollToCell"
import { overMap } from "./lib/fp"
import { isGroup } from "./lib/Group"
import { usePins } from "./lib/hooks/usePins"
import { useQuery } from "./lib/hooks/useQuery"
import { useSelection } from "./lib/hooks/useSelection"
import { useSize } from "./lib/hooks/useSize"
import {
  mkCellRangeRenderer,
  mkCellRenderer,
  Point,
  rowRange,
  stickyRangeRenderer,
} from "./lib/Range"
import { Col, Filters, Row,Schema } from "./lib/Schema"
import { mkRow } from "./lib/Schema/arbitrary"
import * as Query from "./lib/Schema/Query"

const TODO = () => console.log("TODO")

// Very large but not random (takes too long to generate 1M rows)
// Uncomment to test the grid with offset adjustment
// const initialRows: Row[] = Array(1000000).fill(mkRow(0))
// Smaller and random
const initialRows: Row[] = Array(10000).fill(null).map(() => mkRow(0))

const initialColumns: Map<string, Col> = new Map(Schema.columnTags.map((id) => [id, Schema.getCol(id)]))

const headingRange = rowRange(0)

const HEADER_HEIGHT = 70

export default function App(): JSX.Element {
  const gridRef: RefObject<RV.Grid> = useRef(null)
  const [query, setQuery] = useState(Query.Query())
  const [columns, setColumns] = useState(initialColumns)

  const {columnKeys, columnEntry} = useMemo(() => {
    const columnKeys = Array.from(columns.keys())
    const columnEntry = (ix: number): [string, Col] => [columnKeys[ix], columns.get(columnKeys[ix])!]
    return {columnKeys, columnEntry}
  }, [columns])

  const setFilters = useCallback((update: (filters: Filters) => Filters) => setQuery((query) => ({
    ...query,
    filters: update(query.filters),
  })), [])

  const columnWidth = useSize({
    gridRef,
    defaultSize: 130,
  })
  const res = useQuery({ rows: initialRows, query })
  const pins = usePins(pipe(overMap, setColumns))
  const selection = useSelection({
    selectableRange: [[0, 1], [columns.size, res.result.length + 1]],
    scrollToCell: adjustScrollToCell({
      gridRef,
      offset: { columnIndex: pins.pinCount, rowIndex: 1 },
    }),
  })

  useEffect(() => gridRef.current?.recomputeGridSize(), [columns])
  useEffect(() => selection.clearSelection(), [columns, res.result])

  const cellRenderer = useMemo(() => mkCellRenderer(
    [headingRange, ({ columnIndex: index, style }) => {
      const [key, column] = columnEntry(index)
      return (
        <div key={key} style={style}>
          <CM.Context
            renderMenu={(ref, style) => (
              <CM.Menu ref={ref} style={style}>
                <CM.Button
                  onClick={() => setColumns((cols) => {
                    const {...col} = cols.get(key)
                    const ix = Array.from(cols.keys()).indexOf(key)
                    const otherKey = `${column.id}:${Date.now()}`
                    const nextCols = Array.from(cols)
                    nextCols.splice(ix + 1, 0, [otherKey, col])
                    return new Map(nextCols)
                  })}
                >
                  Duplicate
                </CM.Button>
                <CM.Confirm
                  onConfirmed={() => setColumns((cols) => {
                    cols.delete(key)
                    return new Map(cols)
                  })}
                >
                  {(onClick, state) =>
                    <CM.Button onClick={onClick}>
                      {state === "CONFIRM" ? "Really?" : "Delete"}
                    </CM.Button>
                  }
                </CM.Confirm>
                <CM.SubMenu id="filters" label="Filters">
                  <Filter
                    column={column}
                    rows={initialRows}
                    filters={query.filters}
                    setFilters={setFilters} />
                </CM.SubMenu>
                <CM.SubMenu id="test" label="Testing">
                  <CM.Button onClick={() => console.log("lmao")}>Eyy</CM.Button>
                  <CM.SubMenu id="eyy" label="Eyy">lmao</CM.SubMenu>
                </CM.SubMenu>
              </CM.Menu>
            )}
          >
            <HeadingCell
              label={column.id}
              columnIndex={index}
              size={{ width: columnWidth.get(key), height: HEADER_HEIGHT }}
              sorting={Query.sorting(column.id).get(query)}
              isPinned={pins.isPinned(index)}
              isGrouped={Query.isGrouped(column.id).get(query)}
              onChangeGrouped={pipe(Query.isGrouped(column.id).set, setQuery)}
              onChangeSort={pipe(Query.sorting(column.id).set, setQuery)}
              onChangePinned={pins.setPinned(index)}
              onChangeWidth={columnWidth.set(key)}
              onDrop={pins.insertBefore(index)}
            />
          </CM.Context>
        </div>
      )
    }],
    [x => x, ({ columnIndex, rowIndex, style }) => {
      const [colKey, column] = columnEntry(columnIndex)
      const row = res.result[rowIndex - 1]
      if (isGroup(row)) {
        const key = `${colKey}:g:${row.key}`
        const isExpanded = res.isExpanded(row.key)
        return (
          <div key={key} style={style} onClick={() => res.setExpanded(row.key)(!isExpanded)}>
            <GroupCell column={column} rows={row.entries} />
          </div>
        )
      } else {
        const cell = Schema.getCell(column.id, row)
        const coord = Point({ columnIndex, rowIndex })
        const key = `${colKey}:r:${rowIndex}`
        return (
          <div key={key} style={style} {...selection.cellEvents(coord)}>
            <ValueCell cell={cell} isFocused={selection.isFocused(coord)} isSelected={selection.isSelected(coord)} />
          </div>
        )
      }
    }]
  ), [
    pins.pinCount,
    selection.selection,
    selection.isSelecting,
    res.result,
    columns,
    query,
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
            columnCount={columns.size}
            rowCount={res.result.length + 1}
            columnWidth={({ index }) => columnWidth.get(columnKeys[index])}
            rowHeight={({ index }) => index === 0 ? HEADER_HEIGHT : 30}
          />
        )}
      </RV.AutoSizer>
    </DndProvider>
  )
}
