import { useCallback, useState } from "react"
import { Endo } from "./fp"
import { columnIndexRange, emptyRange, Range } from "./multiRangeRenderer"

export type Pins = Set<number>

type UsePins = { pins: Pins, addPin: (ix: number) => void, removePin: (ix: number) => void }

export function usePins(initialPins?: Pins): UsePins {
  const [pins, setPins] = useState(initialPins || new Set() as Pins)
  const addPin = useCallback((ix) => setPins((prevPins) => {
    const nextPins = new Set(prevPins)
    nextPins.add(ix)
    return nextPins
  }), [])
  const removePin = useCallback((ix) => setPins((prevPins) => {
    const nextPins = new Set(prevPins)
    nextPins.delete(ix)
    return nextPins
  }), [])
  return { pins, addPin, removePin }
}

export const applyPins = (pins: Pins) => <T extends unknown>([...as]: T[]): T[] => {
  const pinned: T[] = []
  for (const ix of Array.from(pins)) {
    const [a] = as.splice(ix, 1)
    pinned.push(a)
  }
  return pinned.concat(as)
}

export const getPinnedRange = (pins: Pins, offset = 0): Endo<Range> =>
  pins.size === 0
    ? emptyRange
    : columnIndexRange(offset, offset + pins.size - 1)
