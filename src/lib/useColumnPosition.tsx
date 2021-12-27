import { useState } from "react"
import { Endo } from "./fp"
import { columnIndexRange, emptyRange, Range } from "./multiRangeRenderer"

export type Pins = Set<number>

type UseColumnPosition = {
  pinCount: number
  isPinned: (ix: number) => boolean
  addPin: (ix: number) => void
  removePin: (ix: number) => void
  resetPins: () => void
  setPins: (ixs: number[]) => void
  insertBefore: (ix: number, target: number) => void
  pinnedRange: Endo<Range>
}

export function useColumnPosition(apply: (update: (as: any[]) => any[]) => any): UseColumnPosition {
  const [pinCount, setPinCount] = useState(0)
  const isPinned = (ix: number) => ix < pinCount
  const addPin = (ix: number) => {
    if (isPinned(ix)) return
    apply($insertBefore(ix, pinCount))
    setPinCount((x) => x + 1)
  }
  const removePin = (ix: number) => {
    if (!isPinned(ix)) return
    apply($insertBefore(ix, pinCount - 1))
    setPinCount((x) => x - 1)
  }
  const insertBefore = (ix: number, target: number) => {
    if (isPinned(target)) setPinCount((x) => x + 1)
    apply($insertBefore(ix, target))
  }
  const resetPins = () => setPinCount(0)
  const setPins = (ixs: number[]) => {
    setPinCount(ixs.length)
    apply($moveToStart(ixs))
  }
  return {
    pinCount,
    isPinned,
    addPin,
    removePin,
    insertBefore,
    resetPins,
    setPins,
    pinnedRange: pinCount === 0 ? emptyRange : columnIndexRange(1, pinCount)
  }
}

const $insertBefore = (ix: number, target: number) => (as: any[]): any[] => {
  const [a] = as.splice(ix, 1)
  as.splice(target, 0, a)
  return as
}

const $moveToStart = (ixs: number[]) => (as: any[]): any[] => {
  const start = []
  for (const ix of ixs) {
    const [a] = as.splice(ix, 1)
    start.push(a)
  }
  return start.concat(as)
}
