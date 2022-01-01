import { Big } from "big.js"

import { ColumnTagsOf, TypeTagAt } from "../Table"
import { Schema } from "./Schema"
import { compare,TypeMap } from "./TypeMap"

export type TaggedFilters = {
  [k in keyof TypeMap]: Parameters<typeof TaggedFilterFns[k]>[0]
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

export const TaggedFilterFns = {
  boolean: (filter: { value?: boolean }) => (a: boolean | null) => typeof filter.value === "undefined" || a === filter.value,
  string: (filter: { values: (string | null)[] }) => (a: string | null) => a !== null && filter.values.includes(a),
  number: (filter: ComparisonFilter<number>) => filterCmp(filter, (a, b) => compare({ type: "number", a, b })),
  percent: (filter: ComparisonFilter<Big>) => filterCmp(filter, (a, b) => compare({ type: "percent", a, b })),
  date: (filter: ComparisonFilter<Date>) => filterCmp(filter, (a, b) => compare({ type: "date", a, b })),
} as const

export function applyFilter<id extends ColumnTagsOf<typeof Schema>>(id: id): typeof TaggedFilterFns[TypeTagAt<typeof Schema, id>]
export function applyFilter(id: ColumnTagsOf<typeof Schema>): typeof TaggedFilterFns[TypeTagAt<typeof Schema, typeof id>] {
  return TaggedFilterFns[Schema.getCol(id).type]
}
