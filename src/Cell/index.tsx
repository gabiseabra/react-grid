import { BoolCell } from "./BoolCell";
import { DateCell } from "./DateCell";
import { EnumCell } from "./EnumCell";
import { NumberCell } from "./NumberCell";
import * as RV from 'react-virtualized'

export type CellTypes = {
  string: string
  number: number
  boolean: boolean
  date: Date
}

export type ColDict = {
  [k: string]: {
    type: keyof CellTypes
  } & Record<string, any>
}

export type ColT<C extends ColDict> = { [id in keyof C]: { id: id } & C[id] }[keyof C]

export type RowT<C extends ColDict> = {
  [id in keyof C]: CellTypes[C[id]["type"]]
}

type CellProps<C extends ColDict> = { column: ColT<C>, row: RowT<C> } & RV.GridCellProps

export const renderValue = <C extends ColDict>({
  column,
  row,
  ...props
}: CellProps<C>): JSX.Element => {
  switch (column.type) {
    case "boolean":
      return <BoolCell readOnly value={row[column.id] as boolean} {...props} />;
    case "string":
      return <EnumCell readOnly value={row[column.id] as string} {...props} />;
    case "number":
      return <NumberCell readOnly value={row[column.id] as number} {...props} />;
    case "date":
      return <DateCell readOnly value={row[column.id] as Date} {...props} />;
  }
};

export const renderCell = <C extends ColDict>(props: CellProps<C>): JSX.Element => (
  <div key={props.key} style={props.style}>{renderValue(props)}</div>
)