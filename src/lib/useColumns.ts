import { useState } from "react"
import { Endo, insertBefore as _insertBefore, moveToStart } from "./fp"
import { columnRange, emptyRange, Range } from "./Range/BBox"

export type Pins = Set<number>

export type UseColumns<T> = {
  columns: T[]
  pinCount: number
  isPinned: (ix: number) => boolean
  addPin: (ix: number) => void
  removePin: (ix: number) => void
  resetPins: () => void
  setPins: (ixs: number[]) => void
  pinnedRange: Endo<Range>
  insertBefore: (ix: number, target: number) => void
  setColumns: (columns: T[]) => void
}

const PIN_COLUMN_OFFSET = 0

export function useColumns<T>(initialColumns?: T[]): UseColumns<T> {
  const [columns, setColumns] = useState(initialColumns || [] as T[])
  const [pinCount, setPinCount] = useState(0)
  const isPinned = (ix: number) => ix < pinCount
  const addPin = (ix: number) => {
    if (isPinned(ix)) return
    setColumns(_insertBefore(ix, pinCount))
    setPinCount((x) => x + 1)
  }
  const removePin = (ix: number) => {
    if (!isPinned(ix)) return
    setColumns(_insertBefore(ix, pinCount))
    setPinCount((x) => x - 1)
  }
  const insertBefore = (ix: number, target: number) => {
    if (isPinned(target)) setPinCount((x) => x + 1)
    setColumns(_insertBefore(ix, target))
  }
  const resetPins = () => setPinCount(0)
  const setPins = (ixs: number[]) => {
    setPinCount(ixs.length)
    setColumns(moveToStart(ixs))
  }
  return {
    columns,
    pinCount,
    isPinned,
    addPin,
    removePin,
    resetPins,
    setPins,
    insertBefore,
    pinnedRange: pinCount === 0 ? emptyRange : columnRange(PIN_COLUMN_OFFSET, PIN_COLUMN_OFFSET + pinCount - 1),
    setColumns(columns) {
      resetPins()
      setColumns(columns)
    }
  }
}
