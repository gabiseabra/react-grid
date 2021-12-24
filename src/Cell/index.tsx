import { CellProps } from "../lib/Spreadsheet";
import { BoolCell } from "./BoolCell";
import { DateCell } from "./DateCell";
import { EnumCell } from "./EnumCell";
import { NumberCell } from "./NumberCell";

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

export const renderValue = <C extends ColDict>({
  column,
  row,
  ...props
}: CellProps<ColT<C>, RowT<C>>): JSX.Element => {
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

export const renderCell = <C extends ColDict>(props: CellProps<ColT<C>, RowT<C>>): JSX.Element => (
  <div style={props.style}>{renderValue(props)}</div>
)