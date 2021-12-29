import { Big } from "big.js"

import { Agg, Cmp } from "../../lib/TypeOps"

export type TypeMap = {
  string: string | null,
  number: number | null,
  percent: Big | null,
  boolean: boolean | null,
  date: Date | null
}

export const aggregate: Agg<TypeMap> = (agg) => {
  switch (agg.type) {
    case "string": {
      const distinctCount = new Set(agg.value).size
      const value = (() => {
        if (distinctCount === 0) return ""
        if (distinctCount === 1) return agg.value[0]
        return `${distinctCount} values`
      })()
      return { type: "string", value }
    }
    case "number": {
      const value = agg.value.reduce<number>((acc, x) => acc + (x || 0), 0)
      return { type: "number", value }
    }
    case "boolean": {
      if (!agg.value.length) return { type: "percent", value: null }
      const trueCount = agg.value.reduce<number>((acc, x) => acc + Number(x), 0)
      const value = new Big(trueCount).div(agg.value.length)
      return { type: "percent", value }
    }
    case "percent": {
      if (!agg.value.length) return { type: "percent", value: null }
      const value = agg.value.reduce<Big>((acc, x) => acc.add(x || 0), new Big(0)).div(agg.value.length)
      return { type: "percent", value }
    }
    case "date": return { type: "date", value: null }
  }
}

export const compare: Cmp<TypeMap> = (ty) => {
  if (ty.a === ty.b) return 0
  if (ty.a === null) return -1
  if (ty.b === null) return 1
  switch (ty.type) {
    case "string":
      return ty.a.localeCompare(ty.b)
    case "percent":
      return ty.a.cmp(ty.b)
    default:
      return ty.a > ty.b ? 1 : -1
  }
}
