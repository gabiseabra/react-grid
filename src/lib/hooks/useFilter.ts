import { useMemo, useState } from "react"

import { ColumnTagsOf, RowOf, Table, TypeAt, TypeTagAt, TypeTagsOf } from "../Table"

export type FilterFn<T extends Table<any, any>, F extends Record<TypeTagsOf<T>, any>> = {
  [id in ColumnTagsOf<T>]: (id: id) => (filter: F[TypeTagAt<T, typeof id>]) => (a: TypeAt<T, typeof id>) => boolean
}[ColumnTagsOf<T>]

export type FilterMap<T extends Table<any, any>, F extends Record<TypeTagsOf<T>, any>> = {
  [id in ColumnTagsOf<T>]: F[TypeTagAt<T, id>]
}

export type OnChangeFilter<T extends Table<any, any>, F extends Record<TypeTagsOf<T>, any>>
  = (id: ColumnTagsOf<T>) => (filter?: F[TypeTagAt<T, typeof id>]) => any

export type UseFilters<T extends Table<any, any>, F extends Record<TypeTagsOf<T>, any>> = {
  filters: Partial<FilterMap<T, F>>
  setFilter: OnChangeFilter<T, F>
}

export function useFilters<T extends Table<any, any>, F extends Record<TypeTagsOf<T>, any>>(): UseFilters<T, F> {
  const [filters, $setFilter] = useState({} as Partial<FilterMap<T, F>>)
  const setFilter: OnChangeFilter<T, F> = (id) => (filter) => {
    $setFilter((prevFilters) => ({ ...prevFilters, [id]: filter }))
  }
  return {
    filters,
    setFilter,
  }
}

export function useApplyFilter<T extends Table<any, any>, F extends Record<TypeTagsOf<T>, any>>(
  rows: RowOf<T>[],
  filters: Partial<FilterMap<T, F>>,
  applyFilter: FilterFn<T, F>
): RowOf<T>[] {
  return useMemo(() => {
    const ids: ColumnTagsOf<T>[] = Object.keys(filters)
    return rows.filter((row) => ids.reduce<boolean>((acc, id) => {
      const filter = filters[id]
      if (!acc || !filter) return acc
      return applyFilter(id)(filter!)(row[id])
    }, true))
  }, [rows, filters])
}