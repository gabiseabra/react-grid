import * as RV from 'react-virtualized'
import React from "react";

type Coord = [number, number]
type Box = [Coord, Coord]

type Endo<T> = (x: T) => T

export const box = ({
  columnStartIndex,
  columnStopIndex,
  rowStartIndex,
  rowStopIndex
}: RV.GridCellRangeProps): Box => [
    [columnStartIndex, rowStartIndex],
    [columnStopIndex, rowStopIndex]
  ]

export const rowIndexRange = (ix: number): Endo<Box> => ([[minX, _minY], [maxX, _maxY]]) => [
  [minX, ix],
  [maxX, ix],
]

export const columnIndexRange = (ix: number): Endo<Box> => ([[_minX, minY], [_maxX, maxY]]) => [
  [ix, minY],
  [ix, maxY],
]

// Adapted from https://github.com/bvaughn/react-virtualized/blob/abe0530a512639c042e74009fbf647abdb52d661/source/Grid/defaultCellRangeRenderer.js#L11
export function multiRangeRenderer({
  parent,
  cellCache,
  cellRenderer,
  columnSizeAndPositionManager,
  horizontalOffsetAdjustment,
  isScrolling,
  rowSizeAndPositionManager,
  styleCache,
  verticalOffsetAdjustment,
  visibleColumnIndices,
  visibleRowIndices,
}: RV.GridCellRangeProps, boxes: Box[]): React.ReactNode[] {
  const cellsRendered: { [k: string]: boolean } = {};
  const cells: React.ReactNode[] = [];

  for (const [[columnStartIndex, rowStartIndex], [columnStopIndex, rowStopIndex]] of boxes) {
    for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
      const rowDatum = rowSizeAndPositionManager.getSizeAndPositionOfCell(rowIndex);
      for (let columnIndex = columnStartIndex; columnIndex <= columnStopIndex; columnIndex++) {
        const key = `${rowIndex}-${columnIndex}`;
        if (cellsRendered[key]) continue;
        cellsRendered[key] = true
        const columnDatum = columnSizeAndPositionManager.getSizeAndPositionOfCell(columnIndex);
        const isVisible =
          columnIndex >= visibleColumnIndices.start &&
          columnIndex <= visibleColumnIndices.stop &&
          rowIndex >= visibleRowIndices.start &&
          rowIndex <= visibleRowIndices.stop;
        let style: React.CSSProperties;

        // Cache style objects so shallow-compare doesn't re-render unnecessarily.
        if (styleCache[key]) {
          style = styleCache[key];
        } else {
          style = {
            height: rowDatum.size,
            left: columnDatum.offset + horizontalOffsetAdjustment,
            position: 'absolute',
            top: rowDatum.offset + verticalOffsetAdjustment,
            width: columnDatum.size,
          };

          styleCache[key] = style;
        }

        // Avoid re-creating cells while scrolling.
        // This can lead to the same cell being created many times and can cause performance issues for "heavy" cells.
        // If a scroll is in progress- cache and reuse cells.
        // This cache will be thrown away once scrolling completes.
        // However if we are scaling scroll positions and sizes, we should also avoid caching.
        // This is because the offset changes slightly as scroll position changes and caching leads to stale values.
        // For more info refer to issue #395
        //
        // If isScrollingOptOut is specified, we always cache cells.
        // For more info refer to issue #1028
        if (!cellCache[key]) {
          cellCache[key] = cellRenderer({
            columnIndex,
            isScrolling,
            isVisible,
            key,
            parent,
            rowIndex,
            style,
          });
        }

        const cell = cellCache[key];

        // If the user is no longer scrolling, don't cache cells.
        // This makes dynamic cell content difficult for users and would also lead to a heavier memory footprint.
        // const cell = cellRenderer(cellRendererParams);

        if (cell) cells.push(cell);
      }
    }
  }

  return cells;
}

export const composeRanges = (...fns: Endo<Box>[]): RV.GridCellRangeRenderer => (props) => {
  const box0 = box(props)
  return multiRangeRenderer(props, fns.map((fn) => fn(box0)))
}
