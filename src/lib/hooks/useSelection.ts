import throttle from "lodash/throttle"
import { MouseEventHandler, useEffect, useMemo, useState } from "react"

import { Endo } from "../fp"
import { BBox, eqPoint,isContained, Point } from "../Range/BBox"
import UA from "../UserAgent"

type UseSelectionOptions = {
  selectableRange: BBox,
  scrollToCell: (cell: { columnIndex: number, rowIndex: number }) => any
}

type UseSelection = {
  selection: BBox | undefined,
  isSelecting: boolean,
  isSelected: (xy: Point) => boolean,
  isFocused: (xy: Point) => boolean,
  clearSelection: () => void,
  cellEvents: (xy: Point) => {
    onMouseMove?: MouseEventHandler
    onMouseDown: MouseEventHandler
    onMouseUp: MouseEventHandler
  }
}

const emptyState = {
  isSelecting: false,
  focus: undefined as Point | undefined,
  pivot: undefined as Point | undefined,
}

export function useSelection({
  selectableRange,
  scrollToCell,
}: UseSelectionOptions, deps: any[] = []): UseSelection {
  const [{ isSelecting, focus, pivot }, setState] = useState(emptyState)
  const selection = useMemo(() => focus && pivot && mkRange(focus, pivot), [focus, pivot])
  const isSelected = (cell: Point) => Boolean(selection && isContained([cell, cell])(selection))
  const isFocused = (cell: Point) => Boolean(focus && eqPoint(cell, focus))
  const clearSelection = () => setState(emptyState)

  useEffect(() => {
    if (!isSelecting && focus) scrollToCell({ columnIndex: focus[0], rowIndex: focus[1] })
  }, [focus])

  useEffect(() => {
    function keyDownHandler(e: KeyboardEvent) {
      const delta = getCellDelta(e)
      if (!delta) return
      e.preventDefault()
      const updateCell: Endo<Point> = ([x, y]) => [
        max(selectableRange[0][0], min(selectableRange[1][0] - 1, x + delta[0])),
        max(selectableRange[0][1], min(selectableRange[1][1] - 1, y + delta[1])),
      ]
      setState((state) => ({
        ...state,
        focus: !state.focus ? undefined : updateCell(state.focus),
        pivot: !state.focus || e.shiftKey ? state.pivot : updateCell(state.focus),
      }))
    }

    window.addEventListener("keydown", keyDownHandler)

    return () => window.removeEventListener("keydown", keyDownHandler)
  }, deps)

  return {
    selection,
    isSelecting,
    isFocused,
    isSelected,
    clearSelection,
    // TODO — use a data-* property with the cell's position and memoized event handlers
    cellEvents: (cell) => ({
      onMouseDown: (e) => setState((state) => ({
        isSelecting: true,
        focus: e.shiftKey ? state.focus : cell,
        pivot: cell,
      })),
      onMouseUp: () => setState((state) => ({ ...state, isSelecting: false })),
      onMouseMove: throttle(() => {
        if (isSelecting && !(pivot && eqPoint(cell, pivot))) setState((state) => ({ ...state, pivot: cell }))
      }, 30),
    }),
  }
}

const min = (a: number, b: number) => Math.min(isNaN(a) ? Infinity : a, isNaN(b) ? Infinity : b)
const max = (a: number, b: number) => Math.max(isNaN(a) ? -Infinity : a, isNaN(b) ? -Infinity : b)

const mkRange = (a: Point, b: Point): BBox => [
  [min(a[0], b[0]), min(a[1], b[1])],
  [max(a[0], b[0]), max(a[1], b[1])],
]

const metaKey = (e: KeyboardEvent) => UA.getOS().name === "Mac OS" ? e.metaKey : e.ctrlKey

const getCellDelta = (e: KeyboardEvent): Point | undefined => {
  const delta = metaKey(e) ? Infinity : 1
  switch (e.key) {
    case "ArrowUp": return [0, -delta]
    case "ArrowDown": return [0, delta]
    case "ArrowLeft": return [-delta, 0]
    case "ArrowRight": return [delta, 0]
  }
}
