import { MutableRefObject, RefObject, useRef } from "react"
import * as RV from "react-virtualized"

type UseSizeOptions = {
  gridRef: RefObject<RV.Grid>
  defaultSize: number
}

type UseSize<K extends string | number | symbol> = {
  get: (ix: K) => number
  set: (ix: K) => (size?: number) => void
}

export function useSize<K extends string | number | symbol>({
  gridRef,
  defaultSize
}: UseSizeOptions): UseSize<K> {
  const sizeRef: MutableRefObject<{ [k in K]?: number }> = useRef({})
  return {
    get: (key: K): number => (
      sizeRef.current && sizeRef.current[key] || defaultSize
    ),
    set: (key: K) => (size?: number) => {
      if (!sizeRef.current || !gridRef.current) return
      sizeRef.current[key] = size
      gridRef.current.recomputeGridSize()
    },
  }
}
