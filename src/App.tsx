import "./styles.scss";
import { useMemo } from "react";
import * as RV from 'react-virtualized'
import * as Cell from "./Cell";
import { arbitraryValue } from "./Cell/arbitrary";
import { tableGridProps } from "./lib/Table";
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

export default function App(): JSX.Element {
  const gridProps = useMemo(() => tableGridProps({
    columns,
    rows,
    columnHeight: 50,
    columnWidth: () => 100,
    rowWidth: 50,
    rowHeight: () => 50,
    renderRow: ({ rowIndex, style, key }) => <div key={key} style={style}>{rowIndex}</div>,
    renderCol: ({ columnIndex, style, key }) => <div key={key} style={style}>{columnIndex}</div>,
    renderCell: Cell.renderCell,
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
          {...gridProps}
        />
      )}
    </RV.AutoSizer>
  );
}
