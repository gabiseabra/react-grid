import { RefObject, useCallback, useRef } from "react"
import * as RV from 'react-virtualized'

type UseSizeOptions = {
  columns: { id: string }[],
  rows: any[],
  gridRef: RefObject<RV.Grid>
  headingSize: { width: number, height: number }
  cellSize: { width: number, height: number }
}

type UseSize = {
  getWidth: (ix: number) => number
  getHeight: (ix: number) => number
  setWidth: (ix: number, size?: number) => void
  layoutProps: {
    columnCount: number,
    rowCount: number,
    columnWidth: (ix: RV.Index) => number,
    rowHeight: (ix: RV.Index) => number
  }
}

export function useTableLayout({
  columns,
  rows,
  gridRef,
  headingSize,
  cellSize
}: UseSizeOptions): UseSize {
  const sizeRef: RefObject<{ [k in string]?: number }> = useRef({})
  const getWidth = (ix: number): number => ix === -1 ? headingSize.width : (
    sizeRef.current && sizeRef.current[columns[ix].id] || cellSize.width
  )
  const getHeight = (ix: number): number => ix === -1 ? headingSize.height : cellSize.height
  const setWidth = (ix: number, width?: number) => {
    if (!sizeRef.current || !gridRef.current) return
    const id = columns[ix].id
    sizeRef.current[id] = width
    gridRef.current.recomputeGridSize({ columnIndex: ix + 1 })
  }
  const columnWidth = useCallback(({ index }) => getWidth(index - 1), [])
  const rowHeight = useCallback(({ index }) => getHeight(index - 1), [])
  return {
    getWidth,
    getHeight,
    setWidth,
    layoutProps: {
      rowCount: rows.length + 1,
      columnCount: columns.length + 1,
      columnWidth,
      rowHeight
    }
  }
}