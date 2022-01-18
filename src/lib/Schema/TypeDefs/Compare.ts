import { ABC, mapType, TypeName, TypeOf } from "./TypeDefs"

const cmp = <T>() => (a: T, b: T) => {
  if (a > b) return 1
  if (a < b) return -1
  return 0
}
const cmpString = (a: string, b: string) => a.localeCompare(b)
const cmpMaybe = <T>(cmp: (a: T, b: T) => number) => (a: T | null, b: T | null) => {
  if (a !== null && b !== null) return cmp(a, b)
  if (a === null) return -1
  if (b === null) return 1
  return 0
}

export const Compare: { [T in TypeName]: (a: TypeOf<T>, b: TypeOf<T>) => number } = {
  String: cmpString,
  MaybeString: cmpMaybe(cmpString),
  Date: cmp<Date>(),
  MaybeDate: cmpMaybe(cmp<Date>()),
  ABC: cmp<ABC>(),
} as const

export const compareType = mapType(Compare)
