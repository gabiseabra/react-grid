import { RefObject } from "react"
import * as RV from "react-virtualized"

type Pos = { columnIndex: number, rowIndex: number }

type AdjustScrollToCellOptions = {
  gridRef: RefObject<RV.Grid>,
  /** Start position of the non-sticky cells */
  offset: { columnIndex: number, rowIndex: number },
}

/**
 * Returns a patched version of the grid's `scrollToCell` that accounts for
 * pinned ranges, so that scrolling to a cell snaps it to the edge of the sticky
 * overlay.
 */
export const adjustScrollToCell = ({ gridRef, offset }: AdjustScrollToCellOptions) => (cell: Pos): void => {
  if (!gridRef.current) return
  const offsetOffset = getCellOffset(gridRef.current, offset)
  const cellOffset = getCellOffset(gridRef.current, cell)
  const gridScroll = {
    scrollLeft: gridRef.current.state.scrollLeft,
    scrollTop: gridRef.current.state.scrollTop,
  }
  const offsetAdjustment = getOffsetAdjustment(gridRef.current)
  const cellPos = gridRef.current.getOffsetForCell(cell)
  if (offsetOffset.scrollTop) 
    cellPos.scrollTop -= adjustmentDelta({
      targetOffset: cellOffset.scrollTop,
      stickyOffset: offsetOffset.scrollTop,
      gridScroll: gridScroll.scrollTop,
      offsetAdjustment: offsetAdjustment.scrollTop,
      densityScale: offsetAdjustment.scaleTop,
    })
  if (offsetOffset.scrollLeft)
    cellPos.scrollLeft -= adjustmentDelta({
      targetOffset: cellOffset.scrollLeft,
      stickyOffset: offsetOffset.scrollLeft,
      gridScroll: gridScroll.scrollLeft,
      offsetAdjustment: offsetAdjustment.scrollLeft,
      densityScale: offsetAdjustment.scaleLeft,
    })
  gridRef.current.scrollToPosition(cellPos)
}

type AdjustmentDeltaOptions = {
  targetOffset: number,
  stickyOffset: number,
  gridScroll: number,
  offsetAdjustment: number,
  densityScale: number
}

/**
 * Get scroll delta adjustment
 */
const adjustmentDelta = ({
  targetOffset, 
  stickyOffset, 
  gridScroll, 
  offsetAdjustment, 
  densityScale,
}: AdjustmentDeltaOptions): number =>
  Math.min(
    // This number has to be between the sticky overlay's size and 0.
    // If it is < 0 it means that the target cell is not covered by the sticky overlay
    // and there is no need to adjust the scroll.
    // If it is > stickyOffset it means that the target cell is more than fully covered
    // by the overlay.
    stickyOffset,
    Math.max(
      0,
      // Scroll delta to align the target cell with the sticky edge, relative to the grid's scroll position
      stickyOffset - (
        ( targetOffset - gridScroll )
        + offsetAdjustment
      )
    ) * densityScale
  )

/** Can't get cell's actual position in the grid a without reaching into internals */
const columnSizeAndPositionManager = (grid: RV.Grid): RV.CellSizeAndPositionManager =>
  (grid.state as any).instanceProps.columnSizeAndPositionManager
const rowSizeAndPositionManager = (grid: RV.Grid): RV.CellSizeAndPositionManager =>
  (grid.state as any).instanceProps.rowSizeAndPositionManager

/**
 * Get a cell's top-left scroll position
 */
const getCellOffset = (grid: RV.Grid, cell: Pos) => {
  const col = columnSizeAndPositionManager(grid).getSizeAndPositionOfCell(cell.columnIndex)
  const row = rowSizeAndPositionManager(grid).getSizeAndPositionOfCell(cell.rowIndex)
  return {
    scrollTop: row.offset,
    scrollLeft: col.offset,
  }
}

/**
 * Get the grid's top-left scroll offset adjustment and cell density scaling factor
 * @see https://github.com/bvaughn/react-virtualized/blob/master/CHANGELOG.md#730
 */
 const getOffsetAdjustment = (grid: RV.Grid) => {
  const scrollTop = rowSizeAndPositionManager(grid).getOffsetAdjustment({
    containerSize: grid.props.height,
    offset: grid.state.scrollTop,
  })
  const scrollLeft = columnSizeAndPositionManager(grid).getOffsetAdjustment({
    containerSize: grid.props.width,
    offset: grid.state.scrollLeft,
  })
  const getOffsetPercentage = (manager: RV.CellSizeAndPositionManager) => {
    if (!manager.areOffsetsAdjusted()) return 1
    return (manager as any)._maxScrollSize / (manager as any)._cellSizeAndPositionManager.getTotalSize()
  }
  return {
    scrollTop,
    scrollLeft,
    scaleTop: getOffsetPercentage(rowSizeAndPositionManager(grid)),
    scaleLeft: getOffsetPercentage(columnSizeAndPositionManager(grid)),
  }
}
