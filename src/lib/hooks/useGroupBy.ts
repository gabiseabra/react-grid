import { useEffect, useMemo, useState } from "react"

const IS_GROUP = Symbol("IS_GROUP")

let UID = 0

export type Group<T> = {
  [IS_GROUP]: true
  key: string
  entries: T[]
  isExpanded: boolean
}

function Group<T>(entries: T[]): Group<T> {
  return {
    [IS_GROUP]: true,
    key: `group-${UID++}`,
    entries,
    isExpanded: false,
  }
}

export function isGroup(a: unknown): a is Group<any> {
  return Boolean(a && (a as any)[IS_GROUP])
}

export function groupBy<R>(ids: (keyof R)[], rows: R[]): Group<R>[] {
  const groups: Record<string, Group<R>> = {}
  for (const row of rows) {
    const key = ids.map((id) => String(row[id])).join(":")
    if (groups[key]) groups[key].entries.push(row)
    else groups[key] = Group([row])
  }
  return Object.values(groups)
}

export type UseGroupBy<R> = {
  groups: Group<R>[]
  groupedRows: (Group<R> | R)[]
  groupedColumns: (keyof R)[]
  isGrouped: (id: keyof R) => boolean
  setGroupBy: (id: (keyof R)[]) => void
  addGroupBy: (id: keyof R) => void
  removeGroupBy: (id: keyof R) => void
  setExpanded: (key: string, expanded: boolean) => void
}

export function useGroupBy<R>(rows: R[]): UseGroupBy<R> {
  const [groupedColumns, setGroupBy] = useState([] as (keyof R)[])
  const [groups, setGroups] = useState([] as Group<R>[])

  const addGroupBy = (id: keyof R) => setGroupBy((ids) => [...ids, id])
  const removeGroupBy = (id: keyof R) => setGroupBy((ids) => ids.filter(($id) => $id !== id))
  const setExpanded = (key: string, isExpanded: boolean) => setGroups((groups) => groups.map((group) => {
    if (group.key === key) return { ...group, isExpanded }
    return group
  }))

  const groupedRows: (Group<R> | R)[] = useMemo(() => {
    if (!groups.length) return rows
    return groups.reduce((acc, g) => (
      g.isExpanded
        ? acc.concat(g, g.entries)
        : acc.concat(g)
    ), [] as (Group<R> | R)[])
  }, [groups])

  useEffect(() => {
    setGroups(
      groupedColumns.length
        ? groupBy(groupedColumns, rows)
        : []
    )
  }, [groupedColumns, rows])

  return {
    groups,
    groupedRows,
    groupedColumns,
    isGrouped: groupedColumns.includes,
    setGroupBy,
    addGroupBy,
    removeGroupBy,
    setExpanded,
  }
}
