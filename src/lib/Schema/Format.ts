import { isEqual } from "lodash"

import { TypeMap, TypeTag } from "./TypeMap"

type DateFormat = "YYYY-MM-DD" | "DD/MM/YYYY"

type Locale = "en-GB"

export type FormatMap = {
  string: {
    nullValue?: string
  }
  boolean: {
    mapValues?: {
      false: string
      true: string
      null: string
    }
  }
  number: {
    locale?: Locale
    precision?: number
    nullValue?: string
  }
  percent: {
    locale?: Locale
    precision?: number
    nullValue?: string
  }
  date: {
    format?: DateFormat
    nullValue?: string
  }
}

export type FormatT = { [type in TypeTag]: { type: type } & FormatMap[type] }
export type Format = FormatT[TypeTag]

export const eqFormat = (a: Format, b: Format) => isEqual(a, b)

const defBoolValues = { true: "true", false: "false", null: "—" }

const FormatFns: { [type in TypeTag]: (format: FormatT[type]) => (value: TypeMap[type]) => string } = {
  string: ({ nullValue = "" }) => (value) => value === null ? nullValue : value,
  boolean: ({ mapValues = defBoolValues }) => (value) => (
    value === true
      ? mapValues.true
      : value === false
      ? mapValues.false
      : mapValues.null
  ),
  number: ({ locale, precision, nullValue = "—" }) => {
    const formatter = new Intl.NumberFormat(locale, {
      maximumSignificantDigits: precision,
    })
    return (value) => value === null ? nullValue : formatter.format(value)
  },
  percent: ({ locale, precision, nullValue = "—" }) => {
    const formatter = new Intl.NumberFormat(locale, {
      maximumSignificantDigits: precision,
      unit: "%",
    })
    return (value) => value === null ? nullValue : formatter.format(value.toNumber())
  },
  date: ({ format = "YYYY-MM-DD", nullValue = "—" }) => (value) => {
    if (value === null) return nullValue
    switch(format) {
      case "DD/MM/YYYY": return [
        String(value.getDay() + 1).padStart(2, "0"),
        String(value.getMonth() + 1).padStart(2, "0"),
        String(value.getFullYear()),
      ].join("/")
      case "YYYY-MM-DD": return [
        String(value.getFullYear()),
        String(value.getMonth() + 1).padStart(2, "0"),
        String(value.getDay() + 1).padStart(2, "0"),
      ].join("-")
    }
  },
}

export function applyFormat<type extends TypeTag>(format: FormatT[type]): (a: TypeMap[type]) => string {
  return (FormatFns[format.type] as any)(format)
}
