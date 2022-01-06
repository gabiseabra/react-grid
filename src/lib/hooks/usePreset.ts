import { pipe } from "lodash/fp"
import { Dispatch, SetStateAction, useMemo, useState } from "react"

import { Endo, overMap } from "../fp"
import { BBox } from "../Range"
import { ColId, ColT, Filters, Filters2Filter, GroupBy2IsGrouped,OrderBy2Sorting, Query, Query2Filters, Query2GroupBy, Query2OrderBy, Schema, Sorting } from "../Schema"
import { FormatOptionsMap } from "../Schema/Formatter"
import { TypeTagAt } from "../Table"
import { usePins } from "./usePins"

export type ColOptions = {
  [id in ColId]: ColT[id] & {
    key: string
    format?: FormatOptionsMap[TypeTagAt<Schema>[id]]
    label: string
    width: number
  }
}

export type Preset = {
  columns: ReadonlyMap<string, ColOptions[ColId]>
  query: Query
  pinCount: number
}

export type UsePreset = Preset & {
  setPreset: Dispatch<SetStateAction<Preset>>
  setQuery: Dispatch<SetStateAction<Preset["query"]>>
  setFilters: Dispatch<SetStateAction<Filters>>
  setColumns: Dispatch<SetStateAction<Preset["columns"]>>
  columnKeys: string[]
  columnByIndex: (ix: number) => ColOptions[ColId]
  pinnedRange: Endo<BBox>
  isPinned: (key: string) => boolean
  setPinned: (key: string) => (isPinned: boolean) => void
  setWidth: (key: string) => (width: number) => boolean
  setLabel: (key: string) => (label: string) => void
  setFormat: <id extends ColId>(key: string, id: id) => (format?: FormatOptionsMap[TypeTagAt<Schema>[id]]) => void
  getFilter: <id extends ColId>(id: id) => Filters[id] | undefined
  setFilter: <id extends ColId>(id: id) => (filters?: Filters[id]) => void
  getSorting: <id extends ColId>(id: id) => Sorting | undefined
  setSorting: <id extends ColId>(id: id) => (sorting?: Sorting) => void
  getIsGrouped: <id extends ColId>(id: id) => boolean
  setIsGrouped: <id extends ColId>(id: id) => (isGrouped: boolean) => void
  moveColumn: (ix: number) => (key: string) => void
  insertColumn: (ix: number, col: ColOptions[ColId]) => void
  deleteColumn: (key: string) => () => void
  cloneColumn: (key: string) => () => void
  // TODO Could have a prop indicating the column range modified by the last update to selectively update cells affected by these changes.
  // e.g: useEffect(() => updateCells(columnRange(columnsUpdated)), [columnsUpdated])
  // columnsUpdated: Point
}

export function usePreset(initialPreset: Preset): UsePreset {
  const [columns, setColumns] = useState(initialPreset.columns)
  const [query, setQuery] = useState(initialPreset.query)
  const {
    count: pinCount,
    setCount: setPinCount,
    pinnedRange,
    ...pins
  } = usePins<[string, ColOptions[ColId]]>(pipe(overMap, setColumns), initialPreset.pinCount)
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
  const columnByIndex = (ix: number) => columns.get(columnKeys[ix])!
  const indexByColKey = (k: string) => columnKeys.indexOf(k)
  return {
    columns,
    query,
    pinCount,
    setPreset,
    setQuery,
    setFilters,
    setColumns,
    columnKeys,
    columnByIndex,
    pinnedRange,
    isPinned: pipe(indexByColKey, pins.isPinned),
    moveColumn: (ix) => pipe(indexByColKey, pins.moveTo(ix)),
    deleteColumn: pipe(x => () => x, indexByColKey, pins.deleteAt),
    insertColumn: (ix, col) => pins.insertAt(ix)([col.key, col]),
    cloneColumn: (k) => () => setColumns((cols) => {
      const col = cols.get(k)
      if (!col) return cols
      const ix = Array.from(cols.keys()).indexOf(col.key)
      const nextCol = {...col, key: `${Date.now()}`}
      const nextCols = Array.from(cols)
      nextCols.splice(ix + 1, 0, [nextCol.key, nextCol])
      return new Map(nextCols)
    }),
    setPinned: pipe(indexByColKey, pins.setPinned),
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


const setWidth = (width: number) => (s: ColOptions[ColId]) => ({...s, width})
const setLabel = (label: string) => (s: ColOptions[ColId]) => ({...s, label})
const setFormat = <id extends ColId>(_: id) => (format: FormatOptionsMap[TypeTagAt<Schema>[id]]) => (s: ColOptions[id]) => ({...s, format})

const modifyAt = <K>(key: K) => <A>(fn: (a: A) => A) => (map: Map<K, A>): Map<K, A> => {
  if (!map.has(key)) return map
  const newMap = new Map(map)
  newMap.set(key, fn(newMap.get(key)!))
  return newMap
}

