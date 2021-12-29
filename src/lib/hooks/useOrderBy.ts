import { Dispatch, SetStateAction, useEffect, useState } from "react"

export type Compare<T> = (id: keyof T, a: T, b: T) => number

export type Ordering = "ASC" | "DESC"

const orderBy = <T>(orderedBy: Map<keyof T, Ordering>, compare: Compare<T>) => (a: T, b: T): number => {
  for (const [id, ord] of Array.from(orderedBy)) {
    const mod = ord === "ASC" ? 1 : -1
    const cmp = compare(id, a, b)
    if (cmp) return cmp * mod
  }
  return 0
}

export type UseOrderBy<T> = {
  orderedBy: Map<T, Ordering>
  getOrdering: (id: T) => [Ordering, number] | undefined
  addOrderBy: (id: T, ord: Ordering) => void
  removeOrderBy: (id: T) => void
  setOrderBy: (ord: Map<T, Ordering>) => void
}

export function useOrderBy<T>(setRows: Dispatch<SetStateAction<T[]>>, compare: Compare<T>): UseOrderBy<keyof T> {
  const [orderedBy, setOrderBy] = useState(new Map() as Map<keyof T, Ordering>)

  const addOrderBy = (id: keyof T, ord: Ordering) => setOrderBy((state) => {
    const nextState = new Map(state)
    nextState.set(id, ord)
    return nextState
  })
  const removeOrderBy = (id: keyof T) => setOrderBy((state) => {
    const nextState = new Map(state)
    nextState.delete(id)
    return nextState
  })
  const getOrdering = (id: keyof T) => {
    const entries = Array.from(orderedBy)
    for (let i = 0; i < entries.length; i++)
      if (entries[i][0] === id) return [entries[i][1], i] as [Ordering, number]
  }

  useEffect(() => {
    setRows((rows) => [...rows].sort(orderBy(orderedBy, compare)))
  }, [orderedBy])

  return {
    orderedBy,
    getOrdering,
    setOrderBy,
    addOrderBy,
    removeOrderBy,
  }
}