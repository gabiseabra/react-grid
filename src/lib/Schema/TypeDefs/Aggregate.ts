import { ABC,mapType, TypeName, TypeOf } from "./TypeDefs"

type Formatter<T> = string | ((_: T) => string)

const format = <T>(fmt: Formatter<T>, T: T): string => fmt instanceof Function ? fmt(T) : fmt

export type SetAgg<T> = {
  empty: string
  singular: Formatter<T>
  plural: Formatter<T[]>
}

const defSetAgg: SetAgg<any> = {
  empty: "—",
  singular: "1 Value",
  plural: (as) => `${as.length} Values`,
}

export const AggOptions = {
  String: defSetAgg as SetAgg<string>,
  MaybeString: defSetAgg as SetAgg<string | null>,
  Date: defSetAgg  as SetAgg<Date>,
  MaybeDate: defSetAgg as SetAgg<Date | null>,
  ABC: defSetAgg as SetAgg<ABC>,
} as const

export type AggOptions = typeof AggOptions

export type Agg<T extends TypeName = TypeName>
  = T extends TypeName ? AggOptions[T] : never

function setAgg<T>(opts: SetAgg<T>, as: T[]) {
  const uniques = new Set(as)
  if (uniques.size === 0) return opts.empty
  if (uniques.size === 1) return format(opts.singular, as[0]!)
  return format(opts.plural, Array.from(uniques))
}

export const Agg: { [T in TypeName]: (opts: AggOptions[T], as: TypeOf<T>[]) => string } = {
  String: setAgg,
  MaybeString: setAgg,
  Date: setAgg,
  MaybeDate: setAgg,
  ABC: setAgg,
}

export const aggType = mapType(Agg)
