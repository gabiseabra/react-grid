import { ABC, mapType,TypeName, TypeOf } from "./TypeDefs"

export type MaybeFormat = { nullValue: string }

const defMaybeFormat: MaybeFormat = { nullValue: "—" }

export type DateFormat = { format: "YYYY-MM-DD" }

const defDateFormat: DateFormat = { format: "YYYY-MM-DD" }

export const FormatOptions = {
  String: {},
  MaybeString: defMaybeFormat,
  Date: defDateFormat,
  MaybeDate: {
    ...defMaybeFormat,
    ...defDateFormat,
  },
  ABC: {},
} as const

export type FormatOptions = typeof FormatOptions

export type Format<T extends TypeName = TypeName>
  = T extends TypeName ? FormatOptions[T] : never

const formatString = (_: {}, a: string) => a

const formatMaybe = <T, Fmt>(fn: (_: Fmt, a: T) => string) => (fmt: MaybeFormat & Fmt, a: T | null): string => (
  a === null ? fmt.nullValue : fn(fmt, a)
)

const formatDate = ({ format }: DateFormat, a: Date): string => {
  switch(format) {
    case "YYYY-MM-DD": return [
      String(a.getFullYear()),
      String(a.getMonth() + 1).padStart(2, "0"),
      String(a.getDay() + 1).padStart(2, "0"),
    ].join("-")
  }
}

export const Format: { [T in TypeName]: (opts: FormatOptions[T], a: TypeOf<T>) => string } = {
  String: formatString,
  MaybeString: formatMaybe(formatString),
  Date: formatDate,
  MaybeDate: formatMaybe(formatDate),
  ABC: (_: {}, a: ABC): string => a === 0 ? "A" : a === 1 ? "B" : "C",
}

export const formatType = mapType(Format)
