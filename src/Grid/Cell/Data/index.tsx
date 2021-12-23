import { BoolCell } from "./BoolCell";
import { DateCell } from "./DateCell";
import { EnumCell } from "./EnumCell";
import { NumberCell } from "./NumberCell";

type RenderCellProps<T> = {
  value: T;
  readOnly: boolean;
};

export class CellTypeError extends Error {
  constructor(public value: any) {
    super("Invalid cell type:" + typeof value);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Begin cell type definitions

enum CellType {
  BoolT = 1,
  DateT,
  EnumT,
  NumberT
}

export type CellValue =
  | { type: CellType.BoolT; value: boolean }
  | { type: CellType.DateT; value: Date }
  | { type: CellType.EnumT; value: string }
  | { type: CellType.NumberT; value: number };

export const CellValue = (value: CellValue["value"]): CellValue => {
  if (typeof value === "boolean") return { type: CellType.BoolT, value };
  if (typeof value === "string") return { type: CellType.EnumT, value };
  if (typeof value === "number") return { type: CellType.NumberT, value };
  if (value instanceof Date) return { type: CellType.DateT, value };
  throw new CellTypeError(value);
};

export const renderCell = ({
  value: cell,
  ...props
}: RenderCellProps<CellValue>): JSX.Element => {
  switch (cell.type) {
    case CellType.BoolT:
      return <BoolCell value={cell.value} {...props} />;
    case CellType.EnumT:
      return <EnumCell value={cell.value} {...props} />;
    case CellType.NumberT:
      return <NumberCell value={cell.value} {...props} />;
    case CellType.DateT:
      return <DateCell value={cell.value} {...props} />;
  }
};
