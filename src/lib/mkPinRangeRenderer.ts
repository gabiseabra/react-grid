import React from "react";
import * as RV from 'react-virtualized'

type CommonProps = { key: string, style: React.CSSProperties }

export type Col = {
  width?: number
}

export type ColProps<C extends Col> = {
  value: C,
  columnIndex: number,
} & CommonProps

export type Row = {
  height?: number
}

export type RowProps<R extends Row> = {
  value: R,
  rowIndex: number,
} & CommonProps

type CellProps<C, R> = {
  column: C;
  row: R,
  columnIndex: number;
  rowIndex: number;
} & CommonProps;

export type CellRendererOptions<C extends Col, R extends Row> = {
  columns: C[]
  rows: R[]
  renderCol: (props: ColProps<C>) => React.ReactNode
  renderRow: (props: RowProps<R>) => React.ReactNode
  renderCell: (props: CellProps<C, R>) => React.ReactNode
  renderPlaceholder?: (props: CommonProps) => React.ReactNode
}

const noop = () => null

