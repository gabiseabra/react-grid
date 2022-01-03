import { Big } from "big.js"
import { ColId } from "."

import { TypeTagAt } from "../Table"
import { Schema, Row } from "./Schema"
import { compare } from "./TypeMap"

export type TaggedFilters = {
  boolean: { value?: boolean }
  string: { values: (string | null)[] }
  number: ComparisonFilter<number>
  percent: ComparisonFilter<Big>
  date: ComparisonFilter<Date>
}

export type Filters = {
  [id in ColId]?: TaggedFilters[TypeTagAt<Schema, id>]
}

export type ComparisonFilter<T>
  = { op: "EQ", value: T }
  | { op: "GT", value: T }
  | { op: "GTE", value: T }
  | { op: "LT", value: T }
  | { op: "LTE", value: T }
  | { op: "BETWEEN", a: T, b: T }
  | { op: "BETWEENE", a: T, b: T }

const filterCmp = <T>(filter: ComparisonFilter<T>, cmp: (a: T | null, b: T | null) => number) => (a: T | null): boolean => {
  switch (filter.op) {
    case "EQ": return cmp(a, filter.value) == 0
    case "GT": return cmp(a, filter.value) > 0
    case "GTE": return cmp(a, filter.value) >= 0
    case "LT": return cmp(a, filter.value) < 0
    case "LTE": return cmp(a, filter.value) <= 0
    case "BETWEEN": return cmp(a, filter.a) > 0 && cmp(a, filter.b) < 0
    case "BETWEENE": return cmp(a, filter.a) >= 0 && cmp(a, filter.b) <= 0
  }
}

const TaggedFilterFns = {
  boolean: (filter: { value?: boolean }) => (a: boolean | null) => typeof filter.value === "undefined" || a === filter.value,
  string: (filter: { values: (string | null)[] }) => (a: string | null) => a !== null && filter.values.includes(a),
  number: (filter: ComparisonFilter<number>) => filterCmp(filter, (a, b) => compare({ type: "number", a, b })),
  percent: (filter: ComparisonFilter<Big>) => filterCmp(filter, (a, b) => compare({ type: "percent", a, b })),
  date: (filter: ComparisonFilter<Date>) => filterCmp(filter, (a, b) => compare({ type: "date", a, b })),
} as const

export function filterFn<id extends ColId>(id: id): typeof TaggedFilterFns[TypeTagAt<typeof Schema, id>]
export function filterFn(id: ColId): typeof TaggedFilterFns[TypeTagAt<typeof Schema, typeof id>] {
  return TaggedFilterFns[Schema.getCol(id).type]
}

export const applyFilters = (filters: Filters) => (rows: Row[]): Row[] => {
  const ids = Object.keys(filters) as ColId[]
  return rows.filter((row) => ids.reduce<boolean>((acc, id) => {
    const filter = filters[id]
    if (!acc || !filter) return acc
    return (filterFn(id) as any)(filter)(row[id])
  }, true))
}
