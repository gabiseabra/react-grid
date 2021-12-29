import { ReactNode } from "react"
import * as RV from "react-virtualized"

import { Endo } from "../fp"
import { isEmpty, Range } from "./BBox"

export type RangeRenderer = (nodes: ReactNode[], ctx: { bbox: Range } & RV.GridCellRangeProps) => ReactNode[]

/**
 * Renders _all_ cells in a range with a RangeRenderer function.
 * `Endo<Range>`'s baseline is the range of visible cells in the grid's viewport,
 * additional cells that match are included.
 * This can be used to render additional cells as well as wrapping ranges of cells
 * inside of an html element.
 * 
 * Warning: Each cell is only rendered once, if a multiple ranges match a given
 * cell the first one that matches gets it, so declare smaller/more specific ranges first.
 * 
 * Usage:
 * cellRangeRenderer = mkCellRangeRenderer(
 *   [rowRange(0), (cells) => [<div key="column-heading-cells">{cells}</cells>]],
 *   [x => x, (cells) => [<div key="value-cells">{cells}</div>]]
 * )
 */
export const mkCellRangeRenderer = (...fns: [Endo<Range>, RangeRenderer][]): RV.GridCellRangeRenderer => (props) => {
  const initialRange = Range(props)
  const ranges = fns
    .map(([fn, g]) => [fn(initialRange), g] as [Range, RangeRenderer])
    .filter(([r]) => !isEmpty(r))
  return multiRangeRenderer(ranges)(props)
}

const multiRangeRenderer = (ranges: [Range, RangeRenderer][]): RV.GridCellRangeRenderer => ({
  cellRenderer,
  ...props
}) => {
  const cellsRendered: Record<string, boolean> = {}
  const cells: ReactNode[] = []

  const multiCellRenderer = (props: RV.GridCellProps): ReactNode => {
    if (cellsRendered[props.key]) return null
    cellsRendered[props.key] = true
    return cellRenderer(props)
  }

  for (const [bbox, getNodes] of ranges) {
    const [[columnStartIndex, rowStartIndex], [columnStopIndex, rowStopIndex]] = bbox

    const theseCells = RV.defaultCellRangeRenderer({
      ...props,
      columnStartIndex,
      columnStopIndex,
      rowStartIndex,
      rowStopIndex,
      cellRenderer: multiCellRenderer,
    })

    if (!theseCells.length) continue

    cells.push(...getNodes(theseCells, { bbox, cellRenderer, ...props }))
  }

  return cells
}
