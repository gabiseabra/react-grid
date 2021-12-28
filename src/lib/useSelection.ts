import throttle from 'lodash/throttle'
import { MouseEventHandler, RefObject, useEffect, useMemo, useState } from "react"
import * as RV from 'react-virtualized'
import { Endo } from './fp'
import { Cell, Range, intersects } from "./Range/BBox"


const min = (a: number, b: number) => Math.min(isNaN(a) ? Infinity : a, isNaN(b) ? Infinity : b)
const max = (a: number, b: number) => Math.max(isNaN(a) ? -Infinity : a, isNaN(b) ? -Infinity : b)

const mkRange = (a: Cell, b: Cell): Range => [
  [min(a[0], b[0]), min(a[1], b[1])],
  [max(a[0], b[0]), max(a[1], b[1])]
]

const getCell = (e: KeyboardEvent): Cell | undefined => {
  switch (e.key) {
    case "ArrowUp": return [0, -1]
    case "ArrowDown": return [0, 1]
    case "ArrowLeft": return [-1, 0]
    case "ArrowRight": return [1, 0]
  }
}

type UseSelectionOptions = {
  gridRef: RefObject<RV.Grid>,
  columnCount: number,
  rowCount: number,
  offset?: Cell
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

const cellCmp = (a: Cell, b: Cell): boolean => a[0] === b[0] && a[1] === b[1]

export function useSelection({
  gridRef,
  columnCount,
  rowCount,
}: UseSelectionOptions): UseSelection {
  const [{ isSelecting, focus, pivot }, setState] = useState({
    isSelecting: false,
    focus: [NaN, NaN] as Cell,
    pivot: [NaN, NaN] as Cell
  })
  const selection = useMemo(() => mkRange(focus, pivot), [focus, pivot])
  const isSelected = (cell: Cell) => intersects([cell, cell])(selection)
  const isFocused = (cell: Cell) => cellCmp(cell, focus)
  useEffect(() => {
    if (!isSelecting) {
      gridRef.current?.scrollToCell({
        columnIndex: Math.max(0, focus[0]),
        rowIndex: Math.max(0, focus[1])
      })
    }
  }, [focus])
  useEffect(() => {
    function keyDownHandler(e: KeyboardEvent) {
      const delta = getCell(e)
      if (!delta) return
      e.preventDefault()
      const updateCell: Endo<Cell> = ([x, y]) => [
        max(0, min(columnCount - 1, x + delta[0])),
        max(0, min(rowCount - 1, y + delta[1]))
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
    cellEvents: (cell) => ({
      onMouseDown: (e) => setState((state) => ({
        isSelecting: true,
        focus: cell,
        pivot: e.shiftKey ? state.pivot : cell
      })),
      onMouseUp: () => setState((state) => ({ ...state, isSelecting: false })),
      onMouseMove: throttle(() => {
        if (isSelecting && !cellCmp(cell, pivot)) setState((state) => ({ ...state, pivot: cell }))
      }, 30)
    })
  }
}
