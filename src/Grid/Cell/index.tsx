export * from "./Data";
import "./Cell.scss";
import { CellEvents, useCellEvents } from "./Event";
import { renderCell, CellValue } from "./Data";

export type ItemData = {
  columns: string[];
  rows: { [k: string]: CellValue }[];
  readOnly: boolean;
} & CellEvents<CellValue | undefined>;

export type CellProps = {
  data: ItemData;
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
};

const rowStyle = (style: React.CSSProperties): React.CSSProperties => style;

export function Cell({
  style,
  data: { columns, rows, readOnly, ...cellEvents },
  columnIndex,
  rowIndex
}: CellProps): JSX.Element {
  const columnName = columns[columnIndex];
  const value = rows[rowIndex][columnName];
  const htmlEvents = useCellEvents(cellEvents, {
    value,
    columnName,
    columnIndex,
    rowIndex
  });
  return (
    <div style={rowStyle(style)} className="grid-cell" {...htmlEvents}>
      {renderCell({ value, readOnly })}
    </div>
  );
}
