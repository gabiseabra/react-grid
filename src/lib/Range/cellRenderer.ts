import { ReactNode } from "react"
import * as RV from "react-virtualized"

import { Endo } from "../fp"
import { Cell, isInside, maxBound, Range } from "./BBox"

export type CellRenderer = (props: RV.GridCellProps) => ReactNode

/**
 * Renders _each_ cell in a range with a GridCellRenderer function.
 * `Endo<Range>`'s baseline is the range of all possible cells (maxBound).
 * This is used to define how individual cells are rendered inside of a range.
 * 
 * Warning: Each cell is only rendered once, if a multiple ranges match a given
 * cell the first one that matches gets it, so declare smaller/more specific ranges first.
 * 
 * Usage:
 * cellRenderer = mkCellRenderer(
 *   [rowRange(0), ({ key, style, columnIndex }) => <div key={key} style={style}>{columnIndex}</div>]],
 *   [x => x, ({ key, style, columnIndex, rowIndex }) => <div key={key} style={style}>{rowIndex}x{columnIndex}</div>]
 * )
 */
export const mkCellRenderer = (...$ranges: [Endo<Range>, CellRenderer][]): RV.GridCellRenderer => {
  const ranges: [Range, CellRenderer][] = $ranges.map(([fn, g]) => [fn(maxBound), g])
  return (props) => {
    const cell = Cell(props)
    const match = ranges.find(([range]) => isInside([cell, cell])(range))
    if (match) return match[1](props)
    return null
  }
}
