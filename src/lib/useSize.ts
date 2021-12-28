import { RefObject, useRef } from "react"
import * as RV from 'react-virtualized'

type UseSizeOptions = {
  gridRef: RefObject<RV.Grid>,
  items: { id: string }[],
  defaultSize: number,
  axis: "x" | "y"
}

type UseSize = {
  get: (ix: number) => number
  set: (ix: number, size?: number) => void
}

export function useSize({
  gridRef,
  items,
  defaultSize,
  axis
}: UseSizeOptions): UseSize {
  const sizeRef: RefObject<{ [k in string]?: number }> = useRef({})
  const getSize = (ix: number): number => (
    sizeRef.current && sizeRef.current[items[ix].id] || defaultSize
  )
  const setSize = (ix: number, size?: number) => {
    if (!sizeRef.current || !gridRef.current) return
    const id = items[ix].id
    sizeRef.current[id] = size
    gridRef.current.recomputeGridSize(axis === "x" ? { columnIndex: ix } : { rowIndex: ix })
  }
  return {
    get: getSize,
    set: setSize,
  }
}