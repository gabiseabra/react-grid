import { ColId, Schema } from "./Schema"
import { TypeMap } from "./TypeMap"
import * as T from  "../Table"
import { Get } from "../fp"
import { TaggedFilters } from "./Filters"
import { Row } from "."

export type MapCell<
  from extends keyof TypeMap,
  to extends keyof TypeMap
> = Get<T.TaggedCellOf<Schema>[from], T.TaggedCellOf<T.Table<TypeMap, any>>[to]>

export const mapNull = <type extends keyof TypeMap>(
  type: type,
  valueForNull: TypeMap[type]
): MapCell<type, type> => (cell) => ({
  type,
  value: cell.value === null ? valueForNull : cell.value,
}) as any

export const mapBool = <type extends keyof TypeMap>(
  type: type,
  trueValue: TypeMap[type],
  falseValue: TypeMap[type],
  nullValue: TypeMap[type] = null
): MapCell<"boolean", type> => (cell) => ({
  type,
  value:
    ( cell.value === null ? nullValue
    : cell.value === false ? falseValue
    : trueValue
    ),
}) as any

export type Sort = "ASC" | "DESC"

export type TaggedColumnOptions = {
  [type in keyof TypeMap]: {
    label: string
    width: number
    orderBy?: [number, Sort]
    filters?: TaggedFilters[type]
    isGrouped: boolean
    mapCell: MapCell<type, keyof TypeMap>
  }
}

export type TaggedPresets = {
  [id in ColId]: T.TaggedColOf<Schema>[id] & TaggedColumnOptions[T.TypeTagAt<Schema, id>]
}

export type Preset = TaggedPresets[ColId]

export const Preset = <id extends ColId>(
  id: id,
  preset: Partial<TaggedColumnOptions[T.TypeTagAt<Schema, id>]> = {}
): TaggedPresets[id] => ({
  label: id,
  width: 130,
  isGrouped: false,
  mapCell: (x: T.TaggedCellOf<Schema>) => x,
  ...Schema.getCol(id),
  ...preset,
}) as any
