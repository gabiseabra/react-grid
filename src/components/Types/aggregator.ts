import { TypeMap } from "./TypeMap";
import { Agg } from "../../lib/Group";

export const aggregator: Agg<TypeMap> = (agg) => {
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
      const trueCount = agg.value.reduce<number>((acc, x) => acc + Number(x), 0)
      const value = trueCount / agg.value.length
      return { type: "number", value }
    }
    case "date": return { type: "date", value: null }
  }
}
