import { CellValue, renderCell } from "../Value";
import { RowProps } from "../../Grid";

export function RowComponent({ value, style }: RowProps<CellValue>): JSX.Element {
  return (
    <div className="grid-cell" style={style}>
      {renderCell({ value, readOnly: true })}
    </div>
  );
}
