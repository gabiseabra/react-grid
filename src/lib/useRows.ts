import { useEffect, useMemo, useState } from "react"

import { Group, groupBy as _groupBy } from "./Group"

export type RowGroup<R> = Group<R> & { expanded?: boolean }

export type UseRows<R> = {
  rows: (RowGroup<R> | R)[]
  groupBy: (keyof R)[]
  addGroupBy: (id: keyof R) => void
  removeGroupBy: (id: keyof R) => void
  setGroupBy: (ids: (keyof R)[]) => void
  setGroupExpanded: (key: string, expanded: boolean) => void
  setRows: (rows: R[]) => void
}

export function useRows<R>(initialRows?: R[]): UseRows<R> {
  const [rows, setRows] = useState(initialRows || [] as R[])
  const [groups, setGroups] = useState([] as RowGroup<R>[])
  const [groupBy, setGroupBy] = useState([] as (keyof R)[])

  useEffect(() => {
    if (!groupBy.length) setGroups([])
    else setGroups(_groupBy(groupBy, rows))
  }, [rows, groupBy])

  const groupedRows: (RowGroup<R> | R)[] = useMemo(() => {
    if (!groups.length) return rows
    return groups.reduce((acc, g) => (
      g.expanded
        ? acc.concat(g, g.entries)
        : acc.concat(g)
    ), [] as (RowGroup<R> | R)[])
  }, [groups])

  return {
    rows: groupedRows,
    groupBy,
    setGroupBy,
    addGroupBy: (id) => setGroupBy((ids) => Array.from(new Set([...ids, id]))),
    removeGroupBy: (id) => setGroupBy((ids) => ids.filter(($id) => $id !== id)),
    setGroupExpanded(key, expanded) {
      setGroups((groups) => groups.map((group) => {
        if (group.key === key) return { ...group, expanded }
        return group
      }))
    },
    setRows,
  }
}
