import cx from 'classnames/bind';
import { useMemo } from "react";
import { GridOnScrollProps, VariableSizeGrid } from "react-window";
import { Cell, CellValue, ItemData } from "../Cell";

type Column = {
  id: string;
  width?: number;
};

export type BodyInnerRef = React.Ref<VariableSizeGrid<ItemData>>
export type BodyOuterRef = React.Ref<any>

export type BodyProps = {
  columns: Column[];
  data: { [k: string]: CellValue }[];
  width: number;
  height: number;
  columnWidth: number;
  rowHeight: number;
  readOnly?: boolean;
  innerRef?: BodyInnerRef,
  outerRef?: BodyOuterRef,
  style?: React.CSSProperties,
  className?: string,
  onScroll?: (props: GridOnScrollProps) => any
};

export function Body({
  columns,
  data,
  width,
  height,
  rowHeight,
  columnWidth,
  readOnly = false,
  innerRef,
  outerRef,
  style,
  className,
  onScroll
}: BodyProps): JSX.Element {
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
      ref={innerRef}
      outerRef={outerRef}
      style={style}
      onScroll={onScroll}
      className={cx("grid-body", className)}
    >
      {Cell}
    </VariableSizeGrid>
  );
}
