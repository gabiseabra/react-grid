import { Endo } from "../fp"

export type Point = [number, number]

type PointProps = {
  columnIndex: number,
  rowIndex: number
}

export const Point = ({ columnIndex, rowIndex }: PointProps): Point => [columnIndex, rowIndex]

export type BBox = [Point, Point]

type BBoxProps = {
  columnStartIndex: number,
  columnStopIndex: number,
  rowStartIndex: number,
  rowStopIndex: number
}

export const BBox = ({
  columnStartIndex,
  columnStopIndex,
  rowStartIndex,
  rowStopIndex,
}: BBoxProps): BBox => [
    [columnStartIndex, rowStartIndex],
    [columnStopIndex, rowStopIndex],
  ]

export const empty: BBox = [[NaN, NaN], [NaN, NaN]]

export const maxBound: BBox = [[-Infinity, -Infinity], [Infinity, Infinity]]

/**
 * Matches no cells at all
 */
export const emptyRange: Endo<BBox> = () => empty

/**
 * Matches a cell exactly
 */
export const cellRange = ([x, y]: Point): Endo<BBox> => () => [[x, y], [x, y]]

/**
 * Merges a min/max range on the X axis with the baseline's Y axis
 */
export const rowRange = (minY: number, maxY = minY): Endo<BBox> => ([[minX, _minY], [maxX, _maxY]]) => [
  [minX, minY],
  [maxX, maxY],
]

/**
 * Merges a min/max range on the Y axis with the baseline's X axis
 */
export const columnRange = (minX: number, maxX = minX): Endo<BBox> => ([[_minX, minY], [_maxX, maxY]]) => [
  [minX, minY],
  [maxX, maxY],
]

/**
 * is `a` contained in `b`?
 */
export const isContained = (a: BBox) => (b: BBox): boolean => {
  return (b[0][0] <= a[0][0] && b[1][0] >= a[1][0] && b[0][1] <= a[0][1] && b[1][1] >= a[1][1])
}

export const isEmpty = ([[minX, minY], [maxX, maxY]]: BBox) => (isNaN(minX) || isNaN(minY) || isNaN(maxX) || isNaN(maxY))
