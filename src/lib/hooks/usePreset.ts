import { pipe } from "lodash/fp"
import { Dispatch, SetStateAction, useState } from "react"

import { IMap } from "../IMap"
import { BBox } from "../Range"
import { Col, ColId, Filter, Filters2Filter, Format, GroupBy2IsGrouped, OrderBy2Sorting, Preset, Query2Filters, Query2GroupBy, Query2OrderBy, Sorting } from "../Schema"
import { Endo } from "../Utils"
import { usePins } from "./usePins"

export type UsePreset = {
  preset: Preset
  setPreset: Dispatch<SetStateAction<Preset>>
  // Pins
  isPinned: (key: string) => boolean
  setPinned: (key: string) => (isPinned: boolean) => void
  pinnedRange: Endo<BBox>
  // Column state setters
  setWidth: (key: string) => (width: number) => void
  setLabel: (key: string) => (label: string) => void
  setFormat: (key: string) => (format?: Format) => void
  // Query getters and setters by col id
  // Filters
  getFilter: (id: ColId) => Filter | undefined
  setFilter: (id: ColId) => (filters?: Filter) => void
  // OrderBy
  getSorting: (id: ColId) => Sorting | undefined
  setSorting: (id: ColId) => (sorting?: Sorting) => void
  // GroupBy
  isGrouped: (id: ColId) => boolean
  setGrouped: (id: ColId) => (isGrouped: boolean) => void
  // Column position controls
  deleteColumn: (key: string) => void
  insertColumn: (key: string, col: Col, ix?: number) => void
  moveColumn: (key: string, ix: number) => void
}

export function usePreset(initialPreset: Preset): UsePreset {
  const [columns, setColumns] = useState(initialPreset.columns)
  const [query, setQuery] = useState(initialPreset.query)
  const {
    count: pinCount,
    setCount: setPinCount,
    pinnedRange,
    ...pins
  } = usePins<[string, Col]>(
    (fn) => setColumns((cols) => (
      new IMap(fn(Array.from(cols))))
    ),
    initialPreset.pinCount
  )

  const setPreset: Dispatch<SetStateAction<Preset>> = pipe(
    (fn) => fn instanceof Function ? fn({ columns, query, pinCount }) : fn,
    (nextPreset) => {
      setColumns(nextPreset.columns)
      setQuery(nextPreset.query)
      setPinCount(nextPreset.pinCount)
    }
  )

  return {
    preset: { columns, query, pinCount },
    setPreset,
    pinnedRange,
    isPinned: pipe(columns.index, pins.isPinned),
    deleteColumn: pipe(columns.index, pins.deleteAt),
    insertColumn: (k, v, ix = columns.size) => pins.insertAt(ix)([k, v]),
    moveColumn: (k, ix) => { pins.moveTo(ix)(columns.index(k)) },
    setPinned: pipe(columns.index, pins.setPinned),
    setWidth: (k) => pipe(setWidth, IMap.modify(k), setColumns),
    setLabel: (k) => pipe(setLabel, IMap.modify(k), setColumns),
    setFormat: (k) => pipe(setFormat, IMap.modify(k), setColumns),
    getFilter: (id) => Query2Filters.compose(Filters2Filter(id)).get(query),
    setFilter: (id) => pipe(Query2Filters.compose(Filters2Filter(id)).set, setQuery),
    getSorting: (id) => Query2OrderBy.compose(OrderBy2Sorting(id)).get(query),
    setSorting: (id) => pipe(Query2OrderBy.compose(OrderBy2Sorting(id)).set, setQuery),
    isGrouped: (id) => Query2GroupBy.compose(GroupBy2IsGrouped(id)).get(query),
    setGrouped: (id) => pipe(Query2GroupBy.compose(GroupBy2IsGrouped(id)).set, setQuery),
  }
}

const setWidth = (width: number) => (s: Col) => ({...s, width})
const setLabel = (label: string) => (s: Col) => ({...s, label})
const setFormat = (format: Format) => (s: Col) => ({...s, format})

