import merge from "lodash/merge"
import { Dispatch, SetStateAction, useState } from "react"
import { ColId, ICol, Preset, Schema, Sort, TaggedFilters, TypeMap } from "../Schema"
import { TypeTagAt } from "../Table"
import { Lens } from 'monocle-ts'


type SetPreset = Dispatch<SetStateAction<Preset>>

export type UsePreset = {
  preset: Preset
  setPreset: SetPreset
}

export function usePreset(initialPreset : Preset): UsePreset {
  const [preset, setPreset] = useState(initialPreset)
  return {
    preset,
    setPreset,
  }
}


