import { useState } from "react"

import { BBox,columnRange, emptyRange } from "../Range/BBox"
import { Endo, insertBefore as $insertBefore } from "../Utils"

export type Pins = Set<number>

export type UsePins<A> = {
  count: number
  pinnedRange: Endo<BBox>
  setCount: (count: number) => void
  isPinned: (ix: number) => boolean
  setPinned: (ix: number) => (isPinned: boolean) => void
  // Since changing the order of columns might change their pinned state, these
  // operations have to be handled by usePins.
  moveTo: (target: number) => (ix: number) => void
  deleteAt: (ix: number) => void
  insertAt: (ix: number) => (a: A) => void
}

// TODO parametrize this
const PIN_COLUMN_OFFSET = 0

/**
 * Pinned columns are grouped to one side of the screen so they can be styled
 * with position: sticky, so a column's pinned state affects the order in which
 * it is rendered.
 * The pinned state is broken down into 1) column's positions in a list 2) pin count.
 * Where the first `count` items in the list of columns are the ones pinned.
 * usePins controls both of these properties.
 */
export function usePins<A>(
  // A setState dispatcher to the list of columns controlled by usePin.
  setColumns: (fn: (as: A[]) => A[]) => any,
  initialCount = 0
): UsePins<A> {
  const [count, setCount] = useState(initialCount)

  // There is only support for pinning columns to the left of the grid rn,
  // so the pinned range is 0 through `count`.
  const isPinned = (ix: number) => ix < count

  const pinnedRange =
    count === 0
      ? emptyRange
      : columnRange(
        PIN_COLUMN_OFFSET,
        PIN_COLUMN_OFFSET + count - 1
      )

  // Setting a pin by index moves it to the max pinned range and increase it by 1.
  const addPin = (ix: number) => {
    if (isPinned(ix)) return
    setColumns($insertBefore(count)(ix))
    setCount((x) => x + 1)
  }

  // Removing a pin by index moves it to the max pinned range and decrease it by 1.
  const removePin = (ix: number) => {
    if (!isPinned(ix)) return
    setColumns($insertBefore(count)(ix))
    setCount((x) => x - 1)
  }

  const setPinned = (ix: number) => (isPinned: boolean) => {
    if (isPinned) addPin(ix)
    else removePin(ix)
  }

  // Moving columns might change their pinned state depending on the source and target column's state.
  const moveTo = (target: number) => (ix: number) => {
    if(isPinned(ix) && !isPinned(target)) setCount((x) => x - 1)
    if(!isPinned(ix) && isPinned(target)) setCount((x) => x + 1)
    setColumns($insertBefore(target)(ix))
  }

  const deleteAt = (ix: number) => {
    if (isPinned(ix)) setCount((x) => x - 1)
    setColumns(([...as]) => {
      as.splice(ix, 1)
      return as
    })
  }

  const insertAt = (ix: number) => (a: A) => {
    if (isPinned(ix)) setCount((x) => x + 1)
    setColumns(([...as]) => {
      as.splice(ix, 0, a)
      return as
    })
  }

  return {
    count,
    setCount,
    isPinned,
    setPinned,
    moveTo,
    deleteAt,
    insertAt,
    pinnedRange,
  }
}
