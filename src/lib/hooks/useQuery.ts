import { pipe } from "lodash/fp";
import { useEffect, useMemo, useState } from "react";
import { groupBy, Group } from "../Group";
import { applyFilters, ColId, compare, Order, Query, Row, Schema } from "../Schema";

type UseQueryOptions = {
  rows: Row[],
  query: Query,
}

type UseQuery = {
  result: (Row | Group<Row>)[],
  isExpanded: (key: string) => boolean
  setExpanded: (key: string) => (isExpanded: boolean) => void
}

export function useQuery({rows, query}: UseQueryOptions): UseQuery {
  const [expandedGroups, setExpandedGroups] = useState({} as Record<string, boolean>)

  const isExpanded = (key: string) => Boolean(expandedGroups[key])
  const setExpanded = (key: string) => (isExpanded: boolean) => setExpandedGroups((prevState) => ({
    ...prevState,
    [key]: isExpanded
  }))

  const result: { rows: Row[], groups: Group<Row>[] } = useMemo(() => pipe(
    applyFilters(query.filters),
    applyOrderBy(query.orderBy),
    (rows) => ({ rows, groups: groupBy(query.groupBy)(rows) })
  )(rows), [query])

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

const applyOrderBy = (orderBy: [ColId, Order][]) => (rows: Row[]): Row[] => [...rows].sort(sortFn(orderBy))

const sortFn = (orderBy: [ColId, Order][]) => (a: Row, b: Row): number => {
  for (const [id, ord] of orderBy) {
    const mod = ord === "ASC" ? 1 : -1
    const cmp = compare({ type: Schema.getCol(id).type, a: a[id], b: b[id] } as any)
    if (cmp) return cmp * mod
  }
  return 0
}
