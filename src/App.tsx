import "./styles.scss";
import pipe from 'lodash/fp/pipe'
import { Ref, useMemo, useRef } from "react";
import * as RV from 'react-virtualized'
import * as T from "./lib/Table";
import { tableRenderer } from "./lib/tableRenderer";
import { renderRanges, rowIndexRange } from "./lib/multiRangeRenderer";
import { CellValue, CellTypes } from "./Types";
import { arbitraryValue } from "./Types/arbitrary";
import { stickyRange } from "./lib/stickyRange";
import { Heading } from "./Heading";
import { useTableLayout } from "./lib/useTableLayout";
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { useColumns } from "./lib/useColumns";
import { useRows } from "./lib/useRows";

const Table = new T.Table(new T.TProxy<CellTypes>(), {
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
  ...acc
}), {}) as Row

const initialColumns: Col[] = (Object.keys(Table.Columns) as T.ColumnTagsOf<typeof Table>[]).map((id) => Table.getCol(id))

const initialRows: Row[] = Array(1000).fill(null).map((_, i) => mkRow(i))

export default function App(): JSX.Element {
  const gridRef: Ref<RV.Grid> = useRef(null)
  const {
    columns,
    pinCount,
    isPinned,
    addPin,
    removePin,
    pinnedRange,
    insertBefore
  } = useColumns(initialColumns)
  const { rows } = useRows(initialRows)
  const { getWidth, setWidth, layoutProps } = useTableLayout({
    gridRef,
    columns,
    rows,
    cellSize: { width: 130, height: 30 },
    headingSize: { width: 50, height: 50 }
  })
  const cellRenderer = useMemo(() => tableRenderer(columns, rows, ({ cell, ...props }) => {
    switch (cell.kind) {
      case "cell":
        return (
          <div key={props.key} style={props.style}>
            <CellValue readOnly cell={Table.getCell(cell.column.value.id, cell.row.value)} />
          </div>
        )
      case "column":
        const index = cell.column.index
        const column = cell.column.value
        return (
          <div key={props.key} style={props.style}>
            <Heading
              column={column}
              columnIndex={index}
              pinned={isPinned(index)}
              size={{ width: getWidth(index), height: 50 }}
              onChangePinned={(pinned) => pinned ? addPin(index) : removePin(index)}
              onResize={({ width }) => setWidth(index, width)}
              onDrop={(ix) => insertBefore(ix, index)}
            />
          </div>
        )
      case "row": return <div key={props.key} style={props.style}>{cell.row.index}</div>
      default: return null
    }
  }), [columns, rows, pinCount])
  const cellRangeRenderer = useMemo(() => renderRanges(
    pipe(
      pinnedRange,
      rowIndexRange(0),
      stickyRange({ key: "pinned-heading", top: true, left: true, style: { zIndex: 2 } })
    ),
    pipe(
      rowIndexRange(0),
      stickyRange({ key: "heading", top: true })
    ),
    pipe(
      pinnedRange,
      stickyRange({ key: "pinned", left: true })
    ),
    x => x
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
            {...layoutProps}
          />
        )}
      </RV.AutoSizer>
    </DndProvider>
  );
}
