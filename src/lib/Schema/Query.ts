import { Lens } from "monocle-ts"

import { eqFilters } from "."
import { Filters } from "./Filter"
import { ColId } from "./Schema"

export type Order = "ASC" | "DESC"

export type Sorting = { priority: number, order: Order }

export const eqSorting = (a: Sorting, b: Sorting) => a.priority === b.priority && a.order === b.order

export type OrderBy = [ColId, Order][]

export const eqOrderBy = (a: OrderBy, b: OrderBy) =>
  a.length === b.length && a.reduce<boolean>((acc, ord, ix) => (
    acc && ord[0] === b[ix][0] && ord[1] === b[ix][1]
  ), true)

export type GroupBy = ColId[]

export const eqGroupBy = (a: GroupBy, b: GroupBy) =>
  a.length === b.length && a.reduce<boolean>((acc, id, ix) => acc && id === b[ix], true)

/**
 * Payload to use in server-side requests. Column-specific query options are
 * extracted from here through lens, these properties are shared across all
 * columns with the same ColId in display.
 */
export type Query = {
  orderBy: OrderBy
  groupBy: GroupBy
  filters: Filters
}

export const emptyQuery = {
  orderBy: [],
  groupBy: [],
  filters: {},
}

export const eqQuery = (a: Query, b: Query) =>
  eqOrderBy(a.orderBy, b.orderBy) && eqGroupBy(a.groupBy, b.groupBy) && eqFilters(a.filters, b.filters)

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

export function Filters2Filter<id extends ColId>(id: id): Lens<Filters, Filters[id] | undefined>
export function Filters2Filter(id: ColId): Lens<Filters, Filters[typeof id] | undefined> {
  return new Lens(
    (filters) => filters[id],
    (filter) => (filters) => ({...filters, [id]: filter})
  )
}
