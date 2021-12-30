import "./styles.scss"

import pipe from "lodash/fp/pipe"
import { RefObject, useEffect, useMemo, useRef, useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import * as RV from "react-virtualized"

import { GroupCell } from "./components/GroupCell"
import { HeadingCell } from "./components/HeadingCell"
import { compare, TypeMap } from "./components/Types"
import { arbitraryValue } from "./components/Types/arbitrary"
import { ValueCell } from "./components/ValueCell"
import { adjustScrollToCell } from "./lib/adjustScrollToCell"
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
import * as T from "./lib/Table"
import { Tuple } from "./lib/TypeOps"

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
  db_string10: "string",
  db_string11: "string",
  db_string12: "string",
  db_string13: "string",
  db_string14: "string",
  db_string15: "string",
  db_string16: "string",
  db_string17: "string",
  db_string18: "string",
  db_string19: "string",
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
  db_number10: "number",
  db_number11: "number",
  db_number12: "number",
  db_number13: "number",
  db_number14: "number",
  db_number15: "number",
  db_number16: "number",
  db_number17: "number",
  db_number18: "number",
  db_number19: "number",
  db_percent0: "percent",
  db_percent1: "percent",
  db_percent2: "percent",
  db_percent3: "percent",
  db_percent4: "percent",
  db_percent5: "percent",
  db_percent6: "percent",
  db_percent7: "percent",
  db_percent8: "percent",
  db_percent9: "percent",
  db_percent10: "percent",
  db_percent11: "percent",
  db_percent12: "percent",
  db_percent13: "percent",
  db_percent14: "percent",
  db_percent15: "percent",
  db_percent16: "percent",
  db_percent17: "percent",
  db_percent18: "percent",
  db_percent19: "percent",
  db_boolean0: "boolean",
  db_boolean2: "boolean",
  db_boolean3: "boolean",
  db_boolean4: "boolean",
  db_boolean5: "boolean",
  db_boolean6: "boolean",
  db_boolean7: "boolean",
  db_boolean8: "boolean",
  db_boolean9: "boolean",
  db_boolean10: "boolean",
  db_boolean12: "boolean",
  db_boolean13: "boolean",
  db_boolean14: "boolean",
  db_boolean15: "boolean",
  db_boolean16: "boolean",
  db_boolean17: "boolean",
  db_boolean18: "boolean",
  db_boolean19: "boolean",
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
  db_date10: "date",
  db_date11: "date",
  db_date12: "date",
  db_date13: "date",
  db_date14: "date",
  db_date15: "date",
  db_date16: "date",
  db_date17: "date",
  db_date18: "date",
  db_date19: "date",
})

type Col = T.ColOf<typeof Table>
type Row = T.RowOf<typeof Table>

const mkRow = (i: number): Row => initialColumns.reduce((acc, { id, type }) => ({
  [id]: arbitraryValue(type, i),
  ...acc,
}), {}) as Row

const initialColumns: Col[] = (Object.keys(Table.Columns) as T.ColumnTagsOf<typeof Table>[]).map((id) => Table.getCol(id))

// Very large but not random (takes too long to generate 1M rows)
// Uncomment to test the grid with offset adjustment
// const initialRows: Row[] = Array(1000000).fill(mkRow(0))
// Smaller and random
const initialRows: Row[] = Array(10000).fill(null).map(() => mkRow(0))

const headingRange = rowRange(0)

const HEADER_HEIGHT = 70

export default function App(): JSX.Element {
  const gridRef: RefObject<RV.Grid> = useRef(null)
  const [rows, setRows] = useState(initialRows)
  const [columns, setColumns] = useState(initialColumns)

  const pins = usePins(setColumns)
  const orderBy = useOrderBy(setRows, (id, a, b) => compare({
    type: Table.getCol(id).type,
    a: a[id],
    b: b[id],
  } as Tuple<TypeMap>))
  const groupBy = useGroupBy(rows)
  const selection = useSelection({
    selectableRange: [[0, 1], [columns.length, rows.length + 1]],
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
        const cell = Table.getCell(column.id, row)
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
