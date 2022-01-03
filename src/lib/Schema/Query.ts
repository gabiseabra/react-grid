import { Lens } from "monocle-ts"

import { Filters } from "./Filters"
import { ColId } from "./Schema"

export type Order = "ASC" | "DESC"

export type Sorting = { priority: number, order: Order }

export type Query = {
  orderBy: [ColId, Order][]
  groupBy: ColId[]
  filters: Filters
}

export const Query = (query: Partial<Query> = {}) => ({
  orderBy: [],
  groupBy: [],
  filters: {},
  ...query,
})

export type ColumnOption<id extends ColId> = {
  sorting?: Sorting
  isGrouped: boolean
  filter?: Filters[id]
}

export function sorting(id: ColId): Lens<Query, Sorting | undefined> {
  return new Lens(
    ({orderBy}) => {
      const orderByIx = orderBy.findIndex(([$id, _]) => $id === id)
      return orderByIx >= 0 ? {priority: orderByIx, order: orderBy[orderByIx][1]} : undefined
    },
    (sort) => (query) => {
      const orderBy = [...query.orderBy]
      const ix = orderBy.findIndex(([$id]) => $id === id)
      if (ix >= 0) orderBy.splice(ix, 1)
      if (sort) orderBy.splice(sort.priority, 0, [id, sort.order])
      return {...query, orderBy}
    }
  )
}

export function isGrouped(id: ColId): Lens<Query, boolean> {
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

export function filter<id extends ColId>(id: id): Lens<Query, Filters[id] | undefined>
export function filter(id: ColId): Lens<Query, Filters[typeof id] | undefined> {
  return new Lens(
    ({filters}) => filters[id],
    (filter) => (query) => ({
      ...query,
      filter: {...query.filters, [id]: filter},
    })
  )
}
