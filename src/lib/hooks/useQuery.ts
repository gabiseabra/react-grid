import { pipe } from "lodash/fp"
import { useEffect, useMemo, useState } from "react"

import { getType, Rows } from "../Dataset"
import { Group,groupBy } from "../Group"
import { ColId, compareType, Filters, filterType, Order, Query, Row } from "../Schema"

type UseQuery = {
  result: (Row | Group<Row>)[]
  isExpanded: (key: string) => boolean
  setExpanded: (key: string) => (isExpanded: boolean) => void
}

export function useQuery(query: Query): UseQuery {
  const [expandedGroups, setExpandedGroups] = useState({} as Record<string, boolean>)

  const isExpanded = (key: string) => Boolean(expandedGroups[key])
  const setExpanded = (key: string) => (isExpanded: boolean) => setExpandedGroups((prevState) => ({
    ...prevState,
    [key]: isExpanded,
  }))

  const result: { rows: Row[], groups: Group<Row>[] } = useMemo(() => pipe(
    applyFilters(query.filters),
    applyOrderBy(query.orderBy),
    (rows) => ({ rows, groups: groupBy(query.groupBy)(rows as any) })
  )([...Rows]), [query])

  const groupedResult: (Group<Row> | Row)[] = useMemo(() => {
    if (!result.groups.length) return result.rows
    return result.groups.reduce((acc, g) => (
      isExpanded(g.key)
        ? acc.concat(g, g.entries)
        : acc.concat(g)
    ), [] as (Group<Row> | Row)[])
  }, [result, expandedGroups])

  useEffect(() => setExpandedGroups({}), [result])

  return {
    result: groupedResult,
    isExpanded,
    setExpanded,
  }
}

const applyFilters = (filters: Filters) => (rows: Row[]): Row[] => {
  const apply = (row: Row): boolean =>
    Object.entries(filters).reduce<boolean>((acc, [id, filter]) => {
      if (!acc) return acc
      return filterType(...[
        getType(id),
        filter,
        row[id],
      ] as Parameters<typeof filterType>)
    }, true)
  return rows.filter(apply)
}

const applyOrderBy = (orderBy: [ColId, Order][]) => (rows: Row[]): Row[] => {
  if (!orderBy.length) return rows
  return rows.sort(sortFn(orderBy))
}

const sortFn = (orderBy: [ColId, Order][]) => (a: Row, b: Row): number => {
  for (const [id, ord] of orderBy) {
    const mod = ord === "ASC" ? 1 : -1
    const cmp = compareType(...[
      getType(id),
      a[id],
      b[id],
    ] as Parameters<typeof compareType>)
    if (cmp) return cmp * mod
  }
  return 0
}
