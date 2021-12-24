import React from "react";
import * as RV from 'react-virtualized'

type CommonProps = { key: string, style: React.CSSProperties }

export type ColProps<C> = {
  value: C,
  columnIndex: number,
} & CommonProps

export type RowProps<R> = {
  value: R,
  rowIndex: number,
} & CommonProps

export type CellProps<C, R> = {
  column: C;
  row: R,
  columnIndex: number;
  rowIndex: number;
} & CommonProps;

export type SpreadsheetOptions<C, R> = {
  columns: C[]
  rows: R[]
  /** Height of column heading cells */
  columnHeight: number,
  columnWidth: (ix: RV.Index) => number,
  /** Width of row heading cells */
  rowWidth: number,
  rowHeight: (ix: RV.Index) => number,
  renderCol: (props: ColProps<C>) => React.ReactNode
  renderRow: (props: RowProps<R>) => React.ReactNode
  renderCell: (props: CellProps<C, R>) => React.ReactNode
  renderPlaceholder?: (props: CommonProps) => React.ReactNode
}

const noop = () => null

export const mkSpreadsheetCellRenderer = <C, R>({
  columns,
  rows,
  renderCol,
  renderRow,
  renderCell,
  renderPlaceholder = noop
}: SpreadsheetOptions<C, R>): RV.GridCellRenderer => ({
  columnIndex,
  rowIndex,
  key,
  style,
}) => {
    if (rowIndex === 0 && columnIndex === 0) return renderPlaceholder({ key, style })
    const column = columns[columnIndex - 1]
    const row = rows[rowIndex - 1]
    if (rowIndex === 0) return renderCol({
      key,
      style,
      value: column,
      columnIndex: columnIndex - 1
    })
    if (columnIndex === 0) return renderRow({
      key,
      style,
      value: row,
      rowIndex: rowIndex - 1,
    })
    else return renderCell({
      key,
      style,
      column,
      row,
      rowIndex: rowIndex - 1,
      columnIndex: columnIndex - 1
    })
  }

export const mkSpreadsheetProps = <C, R>(options: SpreadsheetOptions<C, R>) => ({
  cellRenderer: mkSpreadsheetCellRenderer(options),
  columnCount: options.columns.length + 1,
  rowCount: options.rows.length + 1,
  columnWidth: ({ index }: RV.Index): number => (index === 0 ? options.rowWidth : options.columnWidth({ index: index - 1 })),
  rowHeight: ({ index }: RV.Index): number => (index === 0 ? options.columnHeight : options.rowHeight({ index: index - 1 })),
})
