import { Big } from "big.js"

import { TypeTagAt } from "../Table"
import { ColId, Row, Schema } from "./Schema"
import { compare } from "./TypeMap"

export type FilterMap = {
  boolean: { value?: boolean }
  string: { values: (string | null)[] }
  number: ComparisonFilter<number>
  percent: ComparisonFilter<Big>
  date: ComparisonFilter<Date>
}

export type Filters = {
  [id in ColId]?: FilterMap[TypeTagAt<Schema>[id]]
}

export type ComparisonFilter<T>
  = { op: "EQ", value: T }
  | { op: "GT", value: T }
  | { op: "GTE", value: T }
  | { op: "LT", value: T }
  | { op: "LTE", value: T }
  | { op: "BETWEEN", a: T, b: T }
  | { op: "IBETWEEN", a: T, b: T }

const filterCmp = <T>(filter: ComparisonFilter<T>, cmp: (a: T | null, b: T | null) => number) => (a: T | null): boolean => {
  switch (filter.op) {
    case "EQ": return cmp(a, filter.value) == 0
    case "GT": return cmp(a, filter.value) > 0
    case "GTE": return cmp(a, filter.value) >= 0
    case "LT": return cmp(a, filter.value) < 0
    case "LTE": return cmp(a, filter.value) <= 0
    case "BETWEEN": return cmp(a, filter.a) > 0 && cmp(a, filter.b) < 0
    case "IBETWEEN": return cmp(a, filter.a) >= 0 && cmp(a, filter.b) <= 0
  }
}

const FilterFns = {
  boolean: (filter: FilterMap["boolean"]) => (a: boolean | null) => typeof filter.value === "undefined" || a === filter.value,
  string: (filter: FilterMap["string"]) => (a: string | null) => a !== null && filter.values.includes(a),
  number: (filter: FilterMap["number"]) => filterCmp(filter, (a, b) => compare({ type: "number", a, b })),
  percent: (filter: FilterMap["percent"]) => filterCmp(filter, (a, b) => compare({ type: "percent", a, b })),
  date: (filter: FilterMap["date"]) => filterCmp(filter, (a, b) => compare({ type: "date", a, b })),
} as const

export const applyFilters = (filters: Filters) => (rows: Row[]): Row[] => {
  const ids = Object.keys(filters) as ColId[]
  return rows.filter((row) => ids.reduce<boolean>((acc, id) => {
    const filter = filters[id]
    if (!acc || !filter) return acc
    return (FilterFns[Schema.getCol(id).type] as any)(filter)(row[id])
  }, true))
}
