import { Dispatch, SetStateAction, useState } from "react"

import { Endo, insertBefore as _insertBefore, moveToStart } from "../fp"
import { columnRange, emptyRange, Range } from "../Range"

export type Pins = Set<number>

export type UsePins = {
  pinCount: number
  isPinned: (ix: number) => boolean
  addPin: (ix: number) => void
  removePin: (ix: number) => void
  resetPins: () => void
  setPins: (ixs: number[]) => void
  pinnedRange: Endo<Range>
  insertBefore: (ix: number, target: number) => void
}

const PIN_COLUMN_OFFSET = 0

export function usePins(setColumns: Dispatch<SetStateAction<any[]>>): UsePins {
  const [pinCount, setCount] = useState(0)
  const isPinned = (ix: number) => ix < pinCount
  const addPin = (ix: number) => {
    if (isPinned(ix)) return
    setColumns(_insertBefore(ix, pinCount))
    setCount((x) => x + 1)
  }
  const removePin = (ix: number) => {
    if (!isPinned(ix)) return
    setColumns(_insertBefore(ix, pinCount))
    setCount((x) => x - 1)
  }
  const insertBefore = (ix: number, target: number) => {
    if (isPinned(target)) setCount((x) => x + 1)
    setColumns(_insertBefore(ix, target))
  }
  const resetPins = () => setCount(0)
  const setPins = (ixs: number[]) => {
    setCount(ixs.length)
    setColumns(moveToStart(ixs))
  }
  const pinnedRange =
    pinCount === 0
      ? emptyRange
      : columnRange(
        PIN_COLUMN_OFFSET,
        PIN_COLUMN_OFFSET + pinCount - 1
      )
  return {
    pinCount,
    isPinned,
    addPin,
    removePin,
    resetPins,
    setPins,
    insertBefore,
    pinnedRange,
  }
}
