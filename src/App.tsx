import "./styles.scss";
import { useMemo } from "react";
import * as RV from 'react-virtualized'
import * as Cell from "./Cell";
import { arbitraryValue } from "./Cell/arbitrary";
import { tableCellRenderer } from "./lib/Table";
import { columnIndexRange, composeRanges, rowIndexRange } from "./lib/Range";

const Columns = {
  db_string0: { type: "string" },
  db_string1: { type: "string" },
  db_string2: { type: "string" },
  db_string3: { type: "string" },
  db_string4: { type: "string" },
  db_string5: { type: "string" },
  db_string6: { type: "string" },
  db_string7: { type: "string" },
  db_string8: { type: "string" },
  db_string9: { type: "string" },
  db_number0: { type: "number" },
  db_number1: { type: "number" },
  db_number2: { type: "number" },
  db_number3: { type: "number" },
  db_number4: { type: "number" },
  db_number5: { type: "number" },
  db_number6: { type: "number" },
  db_number7: { type: "number" },
  db_number8: { type: "number" },
  db_number9: { type: "number" },
  db_boolean0: { type: "boolean" },
  db_boolean2: { type: "boolean" },
  db_boolean3: { type: "boolean" },
  db_boolean4: { type: "boolean" },
  db_boolean5: { type: "boolean" },
  db_boolean6: { type: "boolean" },
  db_boolean7: { type: "boolean" },
  db_boolean8: { type: "boolean" },
  db_boolean9: { type: "boolean" },
  db_date0: { type: "date" },
  db_date1: { type: "date" },
  db_date2: { type: "date" },
  db_date3: { type: "date" },
  db_date4: { type: "date" },
  db_date5: { type: "date" },
  db_date6: { type: "date" },
  db_date7: { type: "date" },
  db_date8: { type: "date" },
  db_date9: { type: "date" },
} as const

type ColT = Cell.ColT<typeof Columns>
type RowT = Cell.RowT<typeof Columns>

const mkRow = (i: number): RowT => columns.reduce((acc, { id, type }) => ({
  [id]: arbitraryValue(type, i),
  ...acc
}), {}) as RowT

const columns: ColT[] = Object.entries(Columns).map(([id, col]) => ({ id, ...col }) as ColT)

const rows: RowT[] = Array(1000).fill(null).map((_, i) => mkRow(i))

const table = { columns, rows }

export default function App(): JSX.Element {
  const layoutProps = useMemo(() => ({
    columnCount: table.columns.length + 1,
    rowCount: table.rows.length + 1,
    columnWidth({ index }: RV.Index) { return index === 0 ? 50 : 130 },
    rowHeight({ index }: RV.Index) { return index === 0 ? 50 : 30 },
  }), [])
  const cellRenderer = useMemo(() => tableCellRenderer(table, ({ cell, ...props }) => {
    switch (cell.kind) {
      case "cell":
        return Cell.renderCell({
          column: cell.column.value,
          row: cell.row.value,
          ...props
        })
      case "column": return <div key={props.key} style={props.style}>{cell.column.index}</div>
      case "row": return <div key={props.key} style={props.style}>{cell.row.index}</div>
      default: return null
    }
  }), [])
  const cellRangeRenderer = useMemo(() => composeRanges(
    rowIndexRange(0),
    columnIndexRange(0),
    x => x
  ), [])
  return (
    <RV.AutoSizer>
      {({ width, height }) => (
        <RV.Grid
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
  );
}
