import './Cell.scss'
import { BoolCell } from "./Boolean/Cell"
import { DateCell } from "./Date/Cell"
import { NumberCell } from "./Number/Cell"
import { StringCell } from "./String/Cell"

export type CellTypes = {
  string: string | null,
  number: number | null,
  boolean: boolean | null,
  date: Date | null
}

type CellTypeProps = {
  [type in keyof CellTypes]: {
    type: type,
    value: CellTypes[type],
    onChange?: (value: CellTypes[type]) => any,
  }
}[keyof CellTypes]

export type CellValueProps = {
  cell: CellTypeProps,
  readOnly?: boolean
}

export function CellValue({ cell, ...props }: CellValueProps): JSX.Element {
  switch (cell.type) {
    case "boolean":
      return <BoolCell value={cell.value} onChange={cell.onChange} {...props} />;
    case "string":
      return <StringCell value={cell.value} onChange={cell.onChange} {...props} />;
    case "number":
      return <NumberCell value={cell.value} onChange={cell.onChange} {...props} />;
    case "date":
      return <DateCell value={cell.value} onChange={cell.onChange} {...props} />;
  }
}
