import { BoolCell } from "./BoolCell";
import { DateCell } from "./DateCell";
import { EnumCell } from "./EnumCell";
import { NumberCell } from "./NumberCell";

type RenderCellProps<T> = {
  value: T;
  readOnly: boolean;
};

export class CellTypeError extends Error {
  value: any;

  constructor(value: any) {
    super("Invalid cell type:" + typeof value);
    this.value = value;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Begin cell type definitions

export enum CellType {
  Bool,
  Date,
  Enum,
  Number
}

export type CellValue =
  | { type: CellType.Bool; value: boolean }
  | { type: CellType.Date; value: Date }
  | { type: CellType.Enum; value: string }
  | { type: CellType.Number; value: number };

export const Value = (value: CellValue["value"]): CellValue => {
  if (typeof value === "boolean") return { type: CellType.Bool, value };
  if (typeof value === "string") return { type: CellType.Enum, value };
  if (typeof value === "number") return { type: CellType.Number, value };
  if (value instanceof Date) return { type: CellType.Date, value };
  throw new CellTypeError(value);
};

export const renderCell = ({
  value: cell,
  ...props
}: RenderCellProps<CellValue>): JSX.Element => {
  switch (cell.type) {
    case CellType.Bool:
      return <BoolCell value={cell.value} {...props} />;
    case CellType.Enum:
      return <EnumCell value={cell.value} {...props} />;
    case CellType.Number:
      return <NumberCell value={cell.value} {...props} />;
    case CellType.Date:
      return <DateCell value={cell.value} {...props} />;
  }
};
