import { AggOptions, FormatOptions, TypeName } from "./TypeDefs"

export type ColId = string

export type Row = Record<string, unknown>

export type Col<Types extends TypeName = TypeName>
  = { id: ColId }
  // UI state
  & { label: string; width: number }
  // type and type-dependent properties
  & { [T in Types]: {
      type: T
      format: FormatOptions[T]
      agg: AggOptions[T]
    } }[Types]
