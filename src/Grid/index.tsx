export * from "./Cell";
import { useMemo } from "react";
import { VariableSizeGrid } from "react-window";
import { Cell, CellValue } from "./Cell";

type Column = {
  id: string;
  width?: number;
};

export type GridProps = {
  columns: Column[];
  data: { [k: string]: CellValue }[];
  width: number;
  height: number;
  columnWidth: number;
  rowHeight: number;
  readOnly?: boolean;
};

export function Grid({
  columns,
  data,
  width,
  height,
  rowHeight,
  columnWidth,
  readOnly = false
}: GridProps): JSX.Element {
  const itemData = useMemo(
    () => ({
      columns: columns.map((col) => col.id),
      rows: data,
      readOnly
    }),
    [columns, data, readOnly]
  );
  return (
    <VariableSizeGrid
      width={width}
      height={height}
      columnCount={columns.length}
      rowCount={data.length}
      itemData={itemData}
      columnWidth={(ix) => columns[ix]?.width || columnWidth}
      rowHeight={() => rowHeight}
      estimatedColumnWidth={columnWidth}
      estimatedRowHeight={rowHeight}
    >
      {Cell}
    </VariableSizeGrid>
  );
}
