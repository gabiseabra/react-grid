import { Lens } from "monocle-ts"

import { IMap } from "../IMap"
import { Col, ColId } from "./Schema"
import { Filter, TypeName } from "./TypeDefs"

export type Order = "ASC" | "DESC"

export type Sorting = { priority: number, order: Order }

export type OrderBy = [ColId, Order][]

export type GroupBy = ColId[]

export type Filters = Record<ColId, Filter>

/**
 * ColId-indexed column options and payload for server-side requests.
 * As columns may appear duplicated in the grid, these properties are shared
 * between all instances of the same column id in display.
 * These are kept separate (not duplicated) from the individual column's state
 * because otherwise, turning `Col[]` into `Query`, would return different results
 * depending the columns' order.
 */
export type Query = {
  orderBy: OrderBy
  groupBy: GroupBy
  filters: Filters
}

/**
 * Preset captures all of the state of the grid's _columns_ in a serializable structure.
 */
 export type Preset = {
  columns: IMap<string, Col>
  query: Query
  pinCount: number
}

export const emptyQuery: Query = {
  orderBy: [],
  groupBy: [],
  filters: {},
}

export const Preset2Query: Lens<Preset, Query> = Lens.fromProp<Preset>()("query")
export const Query2OrderBy: Lens<Query, OrderBy> = Lens.fromProp<Query>()("orderBy")
export const Query2GroupBy: Lens<Query, GroupBy> = Lens.fromProp<Query>()("groupBy")
export const Query2Filters: Lens<Query, Filters> = Lens.fromProp<Query>()("filters")

export function OrderBy2Sorting(id: ColId): Lens<OrderBy, Sorting | undefined> {
  return new Lens(
    (orderBy) => {
      const orderByIx = orderBy.findIndex(([$id, _]) => $id === id)
      return orderByIx >= 0 ? {priority: orderByIx, order: orderBy[orderByIx][1]} : undefined
    },
    (sort) => ([...orderBy]) => {
      const ix = orderBy.findIndex(([$id]) => $id === id)
      if (ix >= 0) orderBy.splice(ix, 1)
      if (sort) orderBy.splice(sort.priority, 0, [id, sort.order])
      return orderBy
    }
  )
}

export function GroupBy2IsGrouped(id: ColId): Lens<GroupBy, boolean> {
  return new Lens(
    (groupBy) => groupBy.findIndex($id => $id === id) >= 0,
    (isGrouped) => (groupBy) => (
        isGrouped
          ? Array.from(new Set([...groupBy, id]))
          : groupBy.filter(($id) => $id !== id)
    )
  )
}

export function Filters2Filter<T extends TypeName>(id: ColId): Lens<Filters, Filter<T> | undefined>
export function Filters2Filter(id: ColId): Lens<Filters, Filter | undefined> {
  return new Lens(
    (filters) => {
      const filter = filters[id]
      if (typeof filter === "undefined") return
      return filter
    },
    (filter) => ({...filters}) => {
      if (typeof filter === "undefined") delete filters[id]
      else filters[id] = filter
      return filters
    }
  )
}
