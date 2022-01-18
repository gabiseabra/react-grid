import { Compare } from "./Compare"
import { ABC, mapType,TypeName, TypeOf } from "./TypeDefs"

export type SetFilter<T>
  = { op: "IN"; values: T[] }
  | { op: "NOT_IN"; values: T[] }

export type OrdFilter<T>
  = { op: "EQ"; value: T }
  | { op: "GT"; value: T }
  | { op: "LT"; value: T }

export type FilterOptions = {
  String: SetFilter<string>
  MaybeString: SetFilter<string | null>
  Date: OrdFilter<Date>
  MaybeDate: OrdFilter<Date | null>
  ABC: SetFilter<ABC>
}

export type Filter<T extends TypeName = TypeName> = T extends TypeName ? FilterOptions[T] : never

const setFilter = <T>() => (filter: SetFilter<T>, a: T) => {
  const includes = filter.values.includes(a)
  return (filter.op === "IN" ? includes : !includes)
}

const ordFilter = <T>(cmp: (a: T, b: T) => number) => (filter: OrdFilter<T>, a: T) => {
  switch(filter.op) {
    case "EQ": return cmp(filter.value, a) === 0
    case "GT": return cmp(filter.value, a) > 0
    case "LT": return cmp(filter.value, a) < 0
  }
}

export const Filter: { [T in TypeName]: (opts: FilterOptions[T], a: TypeOf<T>) => boolean } = {
  String: setFilter<string>(),
  MaybeString: setFilter<string | null>(),
  Date: ordFilter(Compare.Date),
  MaybeDate: ordFilter(Compare.MaybeDate),
  ABC: setFilter<ABC>(),
}

export const filterType = mapType(Filter)
