import React from "react";
import * as RV from 'react-virtualized'

export type Table<C, R>
  = { columns: C[], rows: R[] }

export type Ix<C> = { value: C, index: number }

export type Cell<C, R>
  // { columnIndex > 0, rowIndex > 0 }
  = { kind: "cell", column: Ix<C>, row: Ix<R> }
  // { columnIndex = 0, rowIndex > 0 }
  | { kind: "row", column: undefined, row: Ix<R> }
  // { columnIndex > 0, rowIndex = 0 }
  | { kind: "column", column: Ix<C>, row: undefined }
  // { columnIndex = 0, rowIndex = 0 }
  | { kind: "placeholder", column: undefined, row: undefined }

type Pos = { rowIndex: number, columnIndex: number }

export const mkCell = <C, R>({ columns, rows }: Table<C, R>) => ({ rowIndex, columnIndex }: Pos): Cell<C, R> => {
  const column = columnIndex === 0 ? undefined : { value: columns[columnIndex - 1], index: columnIndex - 1 }
  const row = rowIndex === 0 ? undefined : { value: rows[rowIndex - 1], index: rowIndex - 1 }
  if (column && row) return { kind: "cell", column, row }
  else if (row) return { kind: "row", column: undefined, row }
  else if (column) return { kind: "column", column, row: undefined }
  else return { kind: "placeholder", column: undefined, row: undefined }
}

export function tableCellRenderer<C, R>(
  table: Table<C, R>,
  renderCell: (props: { cell: Cell<C, R> } & RV.GridCellProps
  ) => React.ReactNode): RV.GridCellRenderer {
  return (props) => renderCell({
    cell: mkCell(table)(props),
    ...props
  })
}
