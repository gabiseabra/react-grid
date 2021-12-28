import { Endo } from "../fp"

export type Cell = [number, number]

type CellProps = {
  columnIndex: number,
  rowIndex: number
}

export const Cell = ({ columnIndex, rowIndex }: CellProps): Cell => [columnIndex, rowIndex]

export type Range = [Cell, Cell]

type RangeProps = {
  columnStartIndex: number,
  columnStopIndex: number,
  rowStartIndex: number,
  rowStopIndex: number
}

export const Range = ({
  columnStartIndex,
  columnStopIndex,
  rowStartIndex,
  rowStopIndex
}: RangeProps): Range => [
    [columnStartIndex, rowStartIndex],
    [columnStopIndex, rowStopIndex]
  ]

export const empty: Range = [[NaN, NaN], [NaN, NaN]]
export const all: Range = [[-Infinity, -Infinity], [Infinity, Infinity]]

export const emptyRange: Endo<Range> = () => empty

export const fullRange: Endo<Range> = () => all

export const cellRange = ([x, y]: Cell): Endo<Range> => () => [[x, y], [x, y]]

export const rowRange = (minY: number, maxY = minY): Endo<Range> => ([[minX, _minY], [maxX, _maxY]]) => [
  [minX, minY],
  [maxX, maxY],
]

export const columnRange = (minX: number, maxX = minX): Endo<Range> => ([[_minX, minY], [_maxX, maxY]]) => [
  [minX, minY],
  [maxX, maxY],
]

export const intersects = (a: Range) => (b: Range): boolean => {
  return (b[0][0] <= a[0][0] && b[1][0] >= a[1][0] && b[0][1] <= a[0][1] && b[1][1] >= a[1][1])
}

export const isEmpty = ([[minX, minY], [maxX, maxY]]: Range) => (isNaN(minX) || isNaN(minY) || isNaN(maxX) || isNaN(maxY))
