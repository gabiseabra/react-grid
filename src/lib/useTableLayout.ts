import { RefObject, useCallback, useRef } from "react"
import * as RV from 'react-virtualized'
import { Table } from "./Table"

type UseSizeOptions = {
  table: Table<{ id: string }, any>
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
  table,
  gridRef,
  headingSize,
  cellSize
}: UseSizeOptions): UseSize {
  const sizeRef: RefObject<{ [k in string]?: number }> = useRef({})
  const getWidth = (ix: number): number => ix === -1 ? headingSize.width : (
    sizeRef.current && sizeRef.current[table.columns[ix].id] || cellSize.width
  )
  const getHeight = (ix: number): number => ix === -1 ? headingSize.height : cellSize.height
  const setWidth = (ix: number, width?: number) => {
    if (!sizeRef.current || !gridRef.current) return
    const id = table.columns[ix].id
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
      rowCount: table.rows.length + 1,
      columnCount: table.columns.length + 1,
      columnWidth,
      rowHeight
    }
  }
}