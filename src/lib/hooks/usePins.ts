import { useState } from "react"

import { Endo, insertBefore as $insertBefore } from "../fp"
import { BBox,columnRange, emptyRange } from "../Range/BBox"

export type Pins = Set<number>

export type UsePins = {
  pinCount: number
  isPinned: (ix: number) => boolean
  setPinned: (ix: number) => (isPinned: boolean) => void
  insertBefore: (target: number) => (ix: number) => void
  pinnedRange: Endo<BBox>
}

const PIN_COLUMN_OFFSET = 0

export function usePins(setColumns: (fn: (as: any[]) => any[]) => any): UsePins {
  const [pinCount, setCount] = useState(0)
  const isPinned = (ix: number) => ix < pinCount
  const addPin = (ix: number) => {
    if (isPinned(ix)) return
    setColumns($insertBefore(pinCount)(ix))
    setCount((x) => x + 1)
  }
  const removePin = (ix: number) => {
    if (!isPinned(ix)) return
    setColumns($insertBefore(pinCount)(ix))
    setCount((x) => x - 1)
  }
  const setPinned = (ix: number) => (isPinned: boolean) => {
    if (isPinned) addPin(ix)
    else removePin(ix)
  }
  const insertBefore = (target: number) => (ix: number) => {
    if (isPinned(target)) setCount((x) => x + 1)
    setColumns($insertBefore(target)(ix))
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
    setPinned,
    insertBefore,
    pinnedRange,
  }
}
