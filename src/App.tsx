import "./styles.scss"

import pipe from "lodash/fp/pipe"
import { RefObject, useEffect, useMemo, useRef } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import * as RV from "react-virtualized"

import { HeadingCell } from "./components/HeadingCell"
import { TypeMap } from "./components/Types"
import { aggregator } from "./components/Types/aggregator"
import { arbitraryValue } from "./components/Types/arbitrary"
import { ValueCell } from "./components/ValueCell"
import { getAgg, isGroup } from "./lib/Group"
import {
  Cell,
  mkCellRangeRenderer,
  mkCellRenderer,
  rowRange,
  stickyRangeRenderer,
} from "./lib/Range"
import * as T from "./lib/Table"
import { useColumns } from "./lib/useColumns"
import { useRows } from "./lib/useRows"
import { useSelection } from "./lib/useSelection"
import { useSize } from "./lib/useSize"

const Table = new T.Table(new T.TProxy<TypeMap>(), {
  db_string0: "string",
  db_string1: "string",
  db_string2: "string",
  db_string3: "string",
  db_string4: "string",
  db_string5: "string",
  db_string6: "string",
  db_string7: "string",
  db_string8: "string",
  db_string9: "string",
  db_number0: "number",
  db_number1: "number",
  db_number2: "number",
  db_number3: "number",
  db_number4: "number",
  db_number5: "number",
  db_number6: "number",
  db_number7: "number",
  db_number8: "number",
  db_number9: "number",
  db_boolean0: "boolean",
  db_boolean2: "boolean",
  db_boolean3: "boolean",
  db_boolean4: "boolean",
  db_boolean5: "boolean",
  db_boolean6: "boolean",
  db_boolean7: "boolean",
  db_boolean8: "boolean",
  db_boolean9: "boolean",
  db_date0: "date",
  db_date1: "date",
  db_date2: "date",
  db_date3: "date",
  db_date4: "date",
  db_date5: "date",
  db_date6: "date",
  db_date7: "date",
  db_date8: "date",
  db_date9: "date",
})

type Col = T.ColOf<typeof Table>
type Row = T.RowOf<typeof Table>

const mkRow = (i: number): Row => initialColumns.reduce((acc, { id, type }) => ({
  [id]: arbitraryValue(type, i),
  ...acc,
}), {}) as Row

const initialColumns: Col[] = (Object.keys(Table.Columns) as T.ColumnTagsOf<typeof Table>[]).map((id) => Table.getCol(id))

const initialRows: Row[] = Array(1000).fill(null).map((_, i) => mkRow(i))

const headingRange = rowRange(0)

export default function App(): JSX.Element {
  const gridRef: RefObject<RV.Grid> = useRef(null)

  const {
    columns,
    pinCount,
    isPinned,
    addPin,
    removePin,
    pinnedRange,
    insertBefore,
  } = useColumns(initialColumns)

  const {
    rows,
    setGroupBy,
    setGroupExpanded,
  } = useRows(initialRows)

  //useEffect(() => setGroupBy(["db_boolean0"]), [])
  useEffect(() => gridRef.current?.recomputeGridSize(), [columns, rows])

  const {
    selection,
    isSelecting,
    isSelected,
    isFocused,
    cellEvents,
  } = useSelection({
    gridRef,
    selectableRange: [[0, 1], [columns.length, rows.length + 1]],
  })

  const columnWidth = useSize({
    gridRef,
    axis: "x",
    defaultSize: 130,
    getKey: (ix) => columns[ix].id,
  })

  const cellRenderer = useMemo(() => mkCellRenderer(
    [headingRange, ({ columnIndex: index, style, key }) => {
      const column = columns[index]
      return (
        <div key={key} style={style}>
          <HeadingCell
            column={column}
            columnIndex={index}
            isPinned={isPinned(index)}
            size={{ width: columnWidth.get(index), height: 50 }}
            onChangePinned={(pinned) => pinned ? addPin(index) : removePin(index)}
            onResize={({ width }) => columnWidth.set(index, width)}
            onDrop={(ix) => insertBefore(ix, index)}
          />
        </div>
      )
    }],
    [x => x, ({ columnIndex, rowIndex, style, key }) => {
      const column = columns[columnIndex]
      const row = rows[rowIndex - 1]
      if (isGroup(row)) {
        return (
          <div key={key} style={style} onClick={() => setGroupExpanded(row.key, !row.expanded)}>
            <ValueCell isGroup cell={getAgg(column, row.entries, aggregator)} />
          </div>
        )
      } else {
        const cell = Table.getCell(column.id, row)
        const coord = Cell({ columnIndex, rowIndex })
        return (
          <div key={key} style={style} {...cellEvents(coord)}>
            <ValueCell cell={cell} isFocused={isFocused(coord)} isSelected={isSelected(coord)} />
          </div>
        )
      }
    }]
  ), [columns, rows, pinCount, selection, isSelecting])

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
            columnCount={columns.length}
            rowCount={rows.length + 1}
            columnWidth={({ index }) => columnWidth.get(index)}
            rowHeight={({ index }) => index === 0 ? 50 : 30}
          />
        )}
      </RV.AutoSizer>
    </DndProvider>
  )
}
