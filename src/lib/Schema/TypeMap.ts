import { Big } from "big.js"
import { CellOf, Table, TaggedCellOf } from "../Table"

export type TypeMap = {
  string: string | null,
  number: number | null,
  percent: Big | null,
  boolean: boolean | null,
  date: Date | null,
}

export type TypeTag = keyof TypeMap

export type CellT = TaggedCellOf<Table<TypeMap, any>>

export type Cell = CellOf<Table<TypeMap, any>>

export type Agg = { [type in TypeTag]: { type: type, values: CellT[type]["value"][] } }[TypeTag]

export function aggregate(agg: Agg): Cell {
  switch (agg.type) {
    case "string": {
      const distinctCount = new Set(agg.values).size
      const value = (() => {
        if (distinctCount === 0) return ""
        if (distinctCount === 1) return agg.values[0]
        return `${distinctCount} values`
      })()
      return { type: "string", value }
    }
    case "number": {
      const value = agg.values.reduce<number>((acc, x) => acc + (x || 0), 0)
      return { type: "number", value }
    }
    case "boolean": {
      if (!agg.values.length) return { type: "percent", value: null }
      const trueCount = agg.values.reduce<number>((acc, x) => acc + Number(x), 0)
      const value = new Big(trueCount).div(agg.values.length)
      return { type: "percent", value }
    }
    case "percent": {
      if (!agg.values.length) return { type: "percent", value: null }
      const value = agg.values.reduce<Big>((acc, x) => acc.add(x || 0), new Big(0)).div(agg.values.length)
      return { type: "percent", value }
    }
    case "date": return { type: "date", value: null }
  }
}

type Cmp = { [type in TypeTag]: { type: type, a: TypeMap[type], b: TypeMap[type] } }[TypeTag]

export function compare(cmp: Cmp) {
  if (cmp.a === cmp.b) return 0
  if (cmp.a === null) return -1
  if (cmp.b === null) return 1
  switch (cmp.type) {
    case "string":
      return cmp.a.localeCompare(cmp.b)
    case "percent":
      return cmp.a.cmp(cmp.b)
    case "boolean":
    case "number":
    case "date":
      if (cmp.a > cmp.b) return 1
      if (cmp.a < cmp.b) return -1
      return 0
  }
}
