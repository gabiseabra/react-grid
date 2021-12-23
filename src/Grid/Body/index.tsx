import cx from 'classnames/bind';
import { useMemo } from "react";
import { GridOnScrollProps, VariableSizeGrid } from "react-window";

export type Col = {
  id: string,
  width: number
}

export type ColProps<C extends Col, D = any> = {
  data: D,
  value: C,
  columnIndex: number,
  style: React.CSSProperties
}

export type Row = any

export type RowProps<R extends Row, D = any> = {
  data: D,
  value: R,
  columnId: string
  columnIndex: number,
  rowIndex: number,
  style: React.CSSProperties
}

export type ItemData<C extends Col, R extends Row, D = any> = {
  data: D,
  columns: C[],
  rows: { [k: string]: R }[],
  renderCol: (props: ColProps<C>) => JSX.Element,
  renderRow: (props: RowProps<R>) => JSX.Element
}

export type BodyInnerRef<C extends Col, R extends Row, D = any> = React.Ref<VariableSizeGrid<ItemData<C, R, D>>>
export type BodyOuterRef = React.Ref<any>

export type BodyProps<C extends Col, R extends Row, D = any> = {
  data: D,
  columns: C[];
  rows: { [k: string]: R }[];
  width: number;
  height: number;
  columnWidth: number;
  rowHeight: number;
  innerRef?: BodyInnerRef<C, R>,
  outerRef?: BodyOuterRef,
  style?: React.CSSProperties,
  className?: string,
  renderCol: (props: ColProps<C>) => JSX.Element,
  renderRow: (props: RowProps<R>) => JSX.Element,
  onScroll?: (props: GridOnScrollProps) => any
};

type CellProps<C extends Col, R extends Row> = {
  data: ItemData<C, R>;
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
};

function Cell<C extends Col, R extends Row>({
  data: {
    data,
    columns,
    rows,
    renderCol,
    renderRow
  },
  columnIndex,
  rowIndex,
  style
}: CellProps<C, R>): JSX.Element {
  if (rowIndex === 0) {
    return renderCol({
      data,
      value: columns[columnIndex],
      columnIndex,
      style
    })
  } else {
    const columnId = columns[columnIndex].id
    return renderRow({
      data,
      value: rows[rowIndex - 1][columnId],
      columnId,
      columnIndex,
      rowIndex,
      style
    })
  }
}

export function Body<C extends Col, R extends Row>({
  data,
  columns,
  rows,
  width,
  height,
  rowHeight,
  columnWidth,
  innerRef,
  outerRef,
  style,
  className,
  renderCol,
  renderRow,
  onScroll
}: BodyProps<C, R>): JSX.Element {
  const itemData = useMemo(
    () => ({
      data,
      columns,
      rows,
      renderRow,
      renderCol
    }),
    [data, columns, rows]
  );
  return (
    <VariableSizeGrid
      width={width}
      height={height}
      columnCount={columns.length}
      rowCount={rows.length + 1}
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
      {Cell as (props: CellProps<C, R>) => JSX.Element}
    </VariableSizeGrid>
  );
}
