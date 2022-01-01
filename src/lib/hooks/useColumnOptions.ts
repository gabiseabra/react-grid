import { useState } from "react"
import { ColId, Preset, Sort } from "../Schema"

export type UsePresets = {
  presets: Preset[]
  groupBy: ColId[]
  orderBy: [ColId, Sort][]
}

export function usePresets(initialPresets: Preset[]): UsePresets {
  const [presets, setPresets] = useState(initialPresets)
  return {

  }
}