import { ReactNode } from "react"
import * as RV from "react-virtualized"

import { Endo } from "../Utils"
import { BBox,isEmpty } from "./BBox"

export type RangeRenderer = (nodes: ReactNode[], ctx: { bbox: BBox } & RV.GridCellRangeProps) => ReactNode[]

/**
 * Renders _all_ cells in a range with a RangeRenderer function.
 * `Endo<BBox>`'s baseline is the range of visible cells in the grid's viewport,
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
export const mkCellRangeRenderer = (...fns: [Endo<BBox>, RangeRenderer][]): RV.GridCellRangeRenderer => (props) => {
  const initialRange = BBox(props)
  const ranges = fns
    .map(([fn, g]) => [fn(initialRange), g] as [BBox, RangeRenderer])
    .filter(([r]) => !isEmpty(r))
  return multiRangeRenderer(ranges)(props)
}

const multiRangeRenderer = (ranges: [BBox, RangeRenderer][]): RV.GridCellRangeRenderer => ({
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
