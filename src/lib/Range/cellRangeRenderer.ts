import * as RV from 'react-virtualized'
import React, { ReactNode } from "react";
import { Endo } from '../fp'
import { isEmpty, Range } from './BBox';

export type RangeRenderer = (nodes: ReactNode[], ctx: { bbox: Range } & RV.GridCellRangeProps) => ReactNode[]

export const mkCellRangeRenderer = (...fns: [Endo<Range>, RangeRenderer][]): RV.GridCellRangeRenderer => (props) => {
  const initialRange = Range(props)
  return multiRangeRenderer(fns.map(([fn, g]) => [fn(initialRange), g]))(props)
}

// Adapted from https://github.com/bvaughn/react-virtualized/blob/abe0530a512639c042e74009fbf647abdb52d661/source/Grid/defaultCellRangeRenderer.js#L11
export const multiRangeRenderer = (ranges: [Range, RangeRenderer][]): RV.GridCellRangeRenderer => (props) => {
  const {
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
  } = props
  const cellsRendered: { [k: string]: boolean } = {};
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < ranges.length; ++i) {
    const [bbox, getNodes] = ranges[i]
    if (isEmpty(bbox)) continue;
    const [[columnStartIndex, rowStartIndex], [columnStopIndex, rowStopIndex]] = bbox
    const cells: React.ReactNode[] = [];
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
    if (!cells.length) continue;

    nodes.push(...getNodes(cells, { bbox, ...props }))
  }

  return nodes;
}