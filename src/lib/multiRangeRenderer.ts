import * as RV from 'react-virtualized'
import React, { ReactNode } from "react";
import { Endo } from './fp'

export type Coord = [number, number]
export type BBox = [Coord, Coord]

export const BBox = ({
  columnStartIndex,
  columnStopIndex,
  rowStartIndex,
  rowStopIndex
}: RV.GridCellRangeProps): BBox => [
    [columnStartIndex, rowStartIndex],
    [columnStopIndex, rowStopIndex]
  ]

type GridFn<T> = (x: T, props: { bbox: BBox } & RV.GridCellRangeProps) => T

export type Range = {
  bbox?: BBox,
  getNodes: GridFn<ReactNode[]>
}

export const Range = (props: RV.GridCellRangeProps): Range => ({ bbox: BBox(props), getNodes: (x) => x })

export const emptyRange: Endo<Range> = ({ getNodes }) => ({ bbox: undefined, getNodes })

export const mapBBox = (fn: Endo<BBox>): Endo<Range> => ({ bbox, getNodes }) => ({
  bbox: bbox ? fn(bbox) : undefined,
  getNodes
})

export const wrapNodes = (fn: GridFn<ReactNode[]>): Endo<Range> => ({ bbox, getNodes }) => ({
  bbox,
  getNodes: (nodes, ctx) => fn(getNodes(nodes, ctx), ctx)
})

export const rowIndexRange = (minY: number, maxY = minY): Endo<Range> => mapBBox(([[minX, _minY], [maxX, _maxY]]) => [
  [minX, minY],
  [maxX, maxY],
])

export const columnIndexRange = (minX: number, maxX = minX): Endo<Range> => mapBBox(([[_minX, minY], [_maxX, maxY]]) => [
  [minX, minY],
  [maxX, maxY],
])

export const shiftX = (x: number): Endo<Range> => mapBBox(([[minX, minY], [maxX, maxY]]) => [[minX + x, minY], [maxX + x, maxY]])

export const shiftY = (y: number): Endo<Range> => mapBBox(([[minX, minY], [maxX, maxY]]) => [[minX, minY + y], [maxX, maxY + y]])

export const renderRanges = (...fns: Endo<Range>[]): RV.GridCellRangeRenderer => (props) => {
  const initialRange = Range(props)
  return multiRangeRenderer(fns.map((fn) => fn(initialRange)))(props)
}

// Adapted from https://github.com/bvaughn/react-virtualized/blob/abe0530a512639c042e74009fbf647abdb52d661/source/Grid/defaultCellRangeRenderer.js#L11
export const multiRangeRenderer = (ranges: Range[]): RV.GridCellRangeRenderer => (props) => {
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
    const range = ranges[i]
    if (!range.bbox) continue;
    const [[columnStartIndex, rowStartIndex], [columnStopIndex, rowStopIndex]] = range.bbox
    let cells: React.ReactNode[] = [];
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

    if (range.getNodes) cells = range.getNodes(cells, { bbox: range.bbox, ...props })

    nodes.push(...cells)
  }

  return nodes;
}
