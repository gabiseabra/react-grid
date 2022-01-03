import { ColId, Col, Schema } from "./Schema"
import * as T from  "../Table"
import { TaggedFilters } from "./Filters"
import { Optional, Lens } from "monocle-ts"
import {some, none} from "fp-ts/Option"

export type Sort = "ASC" | "DESC"

/**
 * A column instance represents the state of a column rendered in the grid.
 */
export type ICol = {
  [id in ColId]: {
    key: string
    label: string
    width: number
  } & T.TaggedColOf<Schema>[id]
}[ColId]

export const ICol = (col: Col): ICol => ({
  ...col,
  key: col.id,
  width: 130,
  label: col.id
})

export type Preset = {
  columns: ICol[]
  orderBy: [ColId, Sort][]
  groupBy: ColId[]
  filters: { [id in ColId]?: TaggedFilters[T.TypeTagAt<Schema, id>] }
}

export const groupBy = Lens.fromProp<Preset>()("groupBy")
export const orderBy = Lens.fromProp<Preset>()("orderBy")
export const filters = Lens.fromProp<Preset>()("filters")
export const columns = Lens.fromProp<Preset>()("columns")

export function iFilters<id extends ColId>(id: id): Lens<Preset, TaggedFilters[T.TypeTagAt<Schema, id>] | undefined>
export function iFilters(id: ColId): Lens<Preset, TaggedFilters[T.TypeTagAt<Schema, typeof id>] | undefined> {
  return new Lens(
    ({ filters }) => filters[id],
    (filter) => (query) => ({
      ...query,
      filters: { ...query.filters, [id]: filter }
    })
  )
}

export function iOrderBy(id: ColId): Lens<Preset, [number, Sort] | undefined> {
  return new Lens(
    ({orderBy}) => {
      const orderByIx = orderBy.findIndex(([$id, _]) => $id === id)
      return orderByIx >= 0 ? [orderByIx, orderBy[orderByIx][1]] : undefined
    },
    (sort) => (query) => {
      let orderBy = [...query.orderBy]
      if (sort) orderBy.splice(sort[0], 0, [id, sort[1]])
      else orderBy = orderBy.filter(([$id]) => $id !== id)
      return {...query, orderBy}
    }
  )
}

export function iGroupBy(id: ColId): Lens<Preset, boolean> {
  return new Lens(
    ({groupBy}) => groupBy.findIndex($id => $id === id) >= 0,
    (isGrouped) => (query) => ({
      ...query,
      groupBy:
        isGrouped
          ? Array.from(new Set([...query.groupBy, id]))
          : query.groupBy.filter(($id) => $id !== id),
    })
  )
}

export function iColumn(key: string): Optional<Preset, ICol> {
  return new Optional(
    ({columns}) => {
      const col = columns.find(({key: $key}) => $key === key)
      return col ? some(col) : none
    },
    (col) => (preset) => {
      const columns = [...preset.columns]
      const ix = columns.findIndex(({key: $key}) => $key === key)
      if (ix >= 0) columns.splice(ix, 1, col)
      else columns.push(col)
      return {
        ...preset,
        columns,
      }
    }
  )
}

export const colWidth = Lens.fromProp<ICol>()("width")
