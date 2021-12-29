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
}

function useRefCurrent<T>(a: T): MutableRefObject<T> {
  const ref = useRef(a)
  ref.current = a
  return ref
}

export function useSize({
  gridRef,
  defaultSize,
  getKey,
  axis,
}: UseSizeOptions): UseSize {
  const getKeyRef: MutableRefObject<(ix: number) => string> = useRefCurrent(getKey)
  const sizeRef: MutableRefObject<{ [k in string]?: number }> = useRef({})
  const getSize = (ix: number): number => (
    sizeRef.current && sizeRef.current[getKey(ix)] || defaultSize
  )
  const setSize = (ix: number, size?: number) => {
    if (!sizeRef.current || !gridRef.current) return
    sizeRef.current[getKeyRef.current(ix)] = size
    gridRef.current.recomputeGridSize(axis === "x" ? { columnIndex: ix } : { rowIndex: ix })
  }
  return {
    get: getSize,
    set: setSize,
  }
}
