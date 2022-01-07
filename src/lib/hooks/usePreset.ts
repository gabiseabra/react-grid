import { zip } from "lodash"
import { pipe } from "lodash/fp"
import { Dispatch, SetStateAction, useMemo, useState } from "react"

import { Endo, overMap } from "../fp"
import { BBox } from "../Range"
import { ColId, ColT, eqFormat,eqQuery, Filters, Filters2Filter, FormatMap, GroupBy2IsGrouped, OrderBy2Sorting, Query, Query2Filters, Query2GroupBy, Query2OrderBy, Schema, Sorting } from "../Schema"
import { TypeTagAt } from "../Table"
import { usePins } from "./usePins"

export type ICol = {
  [id in ColId]: ColT[id] & {
    // Columns may appear duplicated in display, so they need an unique identifier.
    // Keys are meant to be generated at runtime and do not affect equality.
    key: string
    format?: FormatMap[TypeTagAt<Schema>[id]]
    label: string
    width: number
  }
}[ColId]

/** `key` is ignored! */
export const eqICol = (a: ICol, b: ICol) => (
  a.id === b.id &&
  a.label === b.label &&
  a.width === b.width &&
  eqFormat({type: a.type, ...a.format}, {type: b.type, ...b.format})
)

/**
 * Preset captures all of the state of the grid's _columns_ in a serializable structure.
 */
export type Preset = {
  columns: ReadonlyMap<string, ICol>
  query: Query
  pinCount: number
}

export const eqPreset = (a: Preset, b: Preset) => (
  a.pinCount === b.pinCount &&
  a.columns.size === b.columns.size &&
  zip(
    Array.from(a.columns.values()),
    Array.from(b.columns.values())
  ).reduce((acc, [a, b]) => (
    acc && typeof a !== "undefined" && typeof b !== "undefined" && eqICol(a, b)
  ), true) &&
  eqQuery(a.query, b.query)
)

export type UsePreset = {
  preset: Preset
  columnKeys: string[]
  setPreset: Dispatch<SetStateAction<Preset>>
  setQuery: Dispatch<SetStateAction<Preset["query"]>>
  setFilters: Dispatch<SetStateAction<Filters>>
  setColumns: Dispatch<SetStateAction<Preset["columns"]>>
  getColumnByIndex: (ix: number) => ICol
  pinnedRange: Endo<BBox>
  isPinned: (key: string) => boolean
  setPinned: (key: string) => (isPinned: boolean) => void
  setWidth: (key: string) => (width: number) => boolean
  setLabel: (key: string) => (label: string) => void
  setFormat: <id extends ColId>(key: string, id: id) => (format?: FormatMap[TypeTagAt<Schema>[id]]) => void
  getFilter: <id extends ColId>(id: id) => Filters[id] | undefined
  setFilter: <id extends ColId>(id: id) => (filters?: Filters[id]) => void
  getSorting: <id extends ColId>(id: id) => Sorting | undefined
  setSorting: <id extends ColId>(id: id) => (sorting?: Sorting) => void
  getIsGrouped: <id extends ColId>(id: id) => boolean
  setIsGrouped: <id extends ColId>(id: id) => (isGrouped: boolean) => void
  moveColumn: (ix: number) => (key: string) => void
  insertColumn: (ix: number, col: ICol) => void
  deleteColumn: (key: string) => () => void
  cloneColumn: (key: string) => () => void
  // TODO Could have a prop indicating the column range modified by the last update to selectively update cells affected by these changes.
  // e.g: useEffect(() => updateCells(columnRange(columnsUpdated)), [columnsUpdated])
  // columnsUpdated: Point
}

/**
 * usePreset provides getters and setters for controlling the columns' state in react.
 */
export function usePreset(initialPreset: Preset): UsePreset {
  const [columns, setColumns] = useState(initialPreset.columns)
  const [query, setQuery] = useState(initialPreset.query)
  const {
    count: pinCount,
    setCount: setPinCount,
    pinnedRange,
    ...pins
  } = usePins<[string, ICol]>(pipe(overMap, setColumns), initialPreset.pinCount)
  const columnKeys = useMemo(() => Array.from(columns.keys()), [columns])
  const setFilters: Dispatch<SetStateAction<Filters>> = pipe(
    (fn) => Query2Filters.modify(fn instanceof Function ? fn : () => fn),
    setQuery
  )
  const setPreset: Dispatch<SetStateAction<Preset>> = pipe(
    (fn) => fn instanceof Function ? fn({ columns, query, pinCount }) : fn,
    (nextPreset) => {
      setColumns(nextPreset.columns)
      setQuery(nextPreset.query)
      setPinCount(nextPreset.pinCount)
    }
  )
  const getColumnByIndex = (ix: number) => columns.get(columnKeys[ix])!
  const getIndexByColKey = (k: string) => columnKeys.indexOf(k)
  return {
    preset: { columns, query, pinCount },
    columnKeys,
    setPreset,
    setQuery,
    setFilters,
    setColumns,
    getColumnByIndex,
    pinnedRange,
    isPinned: pipe(getIndexByColKey, pins.isPinned),
    moveColumn: (ix) => pipe(getIndexByColKey, pins.moveTo(ix)),
    insertColumn: (ix, col) => pins.insertAt(ix)([col.key, col]),
    deleteColumn: (k) => () => pins.deleteAt(getIndexByColKey(k)),
    cloneColumn: (k) => () => {
      const col = columns.get(k)
      if (!col) return
      const ix = getIndexByColKey(col.key)
      const key = String(Date.now())
      pins.insertAt(ix + 1)([key, {...col, key}])
    },
    setPinned: pipe(getIndexByColKey, pins.setPinned),
    setWidth: (k) => pipe(setWidth, modifyAt(k), setColumns),
    setLabel: (k) => pipe(setLabel, modifyAt(k), setColumns),
    setFormat: (k) => pipe(setFormat(columns.get(k)!.id), modifyAt(k), setColumns),
    getFilter: (id) => Query2Filters.compose(Filters2Filter(id)).get(query),
    setFilter: (id) => pipe(Query2Filters.compose(Filters2Filter(id)).set, setQuery),
    getSorting: (id) => Query2OrderBy.compose(OrderBy2Sorting(id)).get(query),
    setSorting: (id) => pipe(Query2OrderBy.compose(OrderBy2Sorting(id)).set, setQuery),
    getIsGrouped: (id) => Query2GroupBy.compose(GroupBy2IsGrouped(id)).get(query),
    setIsGrouped: (id) => pipe(Query2GroupBy.compose(GroupBy2IsGrouped(id)).set, setQuery),
  }
}

const setWidth = (width: number) => (s: ICol) => ({...s, width})
const setLabel = (label: string) => (s: ICol) => ({...s, label})
const setFormat = <id extends ColId>(id: id) => (format: FormatMap[TypeTagAt<Schema>[id]]) => (s: ICol) => {
  if (s.id !== id) throw new Error(`Mismatched column ids: expected ${id}, got ${s.id}`)
  return {...s, format}
}

const modifyAt = <K>(key: K) => <A>(fn: (a: A) => A) => (map: Map<K, A>): Map<K, A> => {
  if (!map.has(key)) return map
  const newMap = new Map(map)
  newMap.set(key, fn(newMap.get(key)!))
  return newMap
}

