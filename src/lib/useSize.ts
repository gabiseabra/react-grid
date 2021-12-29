import { MutableRefObject, RefObject, useRef } from "react"
import * as RV from "react-virtualized"

type UseSizeOptions = {
  gridRef: RefObject<RV.Grid>
  defaultSize: number
  getKey: (ix: number) => string
  axis: "x" | "y"
}

type UseSize = {
  get: (ix: number) => number
  set: (ix: number, size?: number) => void
  reset: () => void
}

export function useSize({
  gridRef,
  defaultSize,
  getKey,
  axis,
}: UseSizeOptions): UseSize {
  const sizeRef: MutableRefObject<{ [k in string]?: number }> = useRef({})
  const getSize = (ix: number): number => (
    sizeRef.current && sizeRef.current[getKey(ix)] || defaultSize
  )
  const setSize = (ix: number, size?: number) => {
    if (!sizeRef.current || !gridRef.current) return
    sizeRef.current[getKey(ix)] = size
    gridRef.current.recomputeGridSize(axis === "x" ? { columnIndex: ix } : { rowIndex: ix })
  }
  return {
    get: getSize,
    set: setSize,
    reset() {
      sizeRef.current = {}
      gridRef.current?.recomputeGridSize()
    },
  }
}