import React from "react";
import * as RV from 'react-virtualized'
import { Table } from "./Table";

export type Ix<C> = { value: C, index: number }

export type Cell<C, R>
  // { columnIndex > 0, rowIndex > 0 }
  = { kind: "cell", column: Ix<C>, row: Ix<R> }
  // { columnIndex = 0, rowIndex > 0 }
  | { kind: "row", row: Ix<R> }
  // { columnIndex > 0, rowIndex = 0 }
  | { kind: "column", column: Ix<C> }
  // { columnIndex = 0, rowIndex = 0 }
  | { kind: "placeholder" }

type Pos = { rowIndex: number, columnIndex: number }

export const Cell = <C, R>({ columns, rows }: Table<C, R>) => ({ rowIndex, columnIndex }: Pos): Cell<C, R> => {
  const column = columnIndex === 0 ? undefined : { value: columns[columnIndex - 1], index: columnIndex - 1 }
  const row = rowIndex === 0 ? undefined : { value: rows[rowIndex - 1], index: rowIndex - 1 }
  if (column && row) return { kind: "cell", column, row }
  else if (row) return { kind: "row", row }
  else if (column) return { kind: "column", column }
  else return { kind: "placeholder" }
}

export function tableRenderer<C, R>(
  table: Table<C, R>,
  renderCell: (props: { cell: Cell<C, R> } & RV.GridCellProps) => React.ReactNode
): RV.GridCellRenderer {
  return (props) => renderCell({
    cell: Cell(table)(props),
    ...props
  })
}
