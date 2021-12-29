import throttle from "lodash/throttle"
import { MouseEventHandler, RefObject, useEffect, useMemo, useState } from "react"
import * as RV from "react-virtualized"

import { Endo } from "./fp"
import { Cell, isInside, Range } from "./Range"
import UA from "./UserAgent"

const min = (a: number, b: number) => Math.min(isNaN(a) ? Infinity : a, isNaN(b) ? Infinity : b)
const max = (a: number, b: number) => Math.max(isNaN(a) ? -Infinity : a, isNaN(b) ? -Infinity : b)

const mkRange = (a: Cell, b: Cell): Range => [
  [min(a[0], b[0]), min(a[1], b[1])],
  [max(a[0], b[0]), max(a[1], b[1])],
]

const cellCmp = (a: Cell, b: Cell): boolean => a[0] === b[0] && a[1] === b[1]

const metaKey = (e: KeyboardEvent) => UA.getOS().name === "Mac OS" ? e.metaKey : e.ctrlKey

const getCellDelta = (e: KeyboardEvent): Cell | undefined => {
  const delta = metaKey(e) ? Infinity : 1
  switch (e.key) {
    case "ArrowUp": return [0, -delta]
    case "ArrowDown": return [0, delta]
    case "ArrowLeft": return [-delta, 0]
    case "ArrowRight": return [delta, 0]
  }
}

type UseSelectionOptions = {
  gridRef: RefObject<RV.Grid>,
  selectableRange: Range,
}

type UseSelection = {
  selection: Range,
  isSelecting: boolean,
  isSelected: (xy: Cell) => boolean,
  isFocused: (xy: Cell) => boolean,
  cellEvents: (xy: Cell) => {
    onMouseMove?: MouseEventHandler
    onMouseDown: MouseEventHandler
    onMouseUp: MouseEventHandler
  }
}

export function useSelection({
  gridRef,
  selectableRange,
}: UseSelectionOptions): UseSelection {
  const [{ isSelecting, focus, pivot }, setState] = useState({
    isSelecting: false,
    focus: [NaN, NaN] as Cell,
    pivot: [NaN, NaN] as Cell,
  })
  const selection = useMemo(() => mkRange(focus, pivot), [focus, pivot])
  const isSelected = (cell: Cell) => isInside([cell, cell])(selection)
  const isFocused = (cell: Cell) => cellCmp(cell, focus)

  useEffect(() => {
    if (!isSelecting)
      gridRef.current?.scrollToCell({ columnIndex: focus[0], rowIndex: focus[1] })
  }, [focus])

  useEffect(() => {
    function keyDownHandler(e: KeyboardEvent) {
      const delta = getCellDelta(e)
      if (!delta) return
      e.preventDefault()
      const updateCell: Endo<Cell> = ([x, y]) => [
        max(selectableRange[0][0], min(selectableRange[1][0] - 1, x + delta[0])),
        max(selectableRange[0][1], min(selectableRange[1][1] - 1, y + delta[1])),
      ]
      setState((state) => ({
        ...state,
        focus: updateCell(state.focus),
        pivot: e.shiftKey ? state.pivot : updateCell(state.focus),
      }))
    }

    window.addEventListener("keydown", keyDownHandler)

    return () => window.removeEventListener("keydown", keyDownHandler)
  }, [])

  return {
    selection,
    isSelecting,
    isFocused,
    isSelected,
    // TODO — use a data-* property with the cell's position and memoized event handlers
    cellEvents: (cell) => ({
      onMouseDown: (e) => setState((state) => ({
        isSelecting: true,
        focus: e.shiftKey ? state.focus : cell,
        pivot: cell,
      })),
      onMouseUp: () => setState((state) => ({ ...state, isSelecting: false })),
      onMouseMove: throttle(() => {
        if (isSelecting && !cellCmp(cell, pivot)) setState((state) => ({ ...state, pivot: cell }))
      }, 30),
    }),
  }
}
