import { useState } from "react"

export type Pins = Set<number>

export type UseRows<T> = {
  rows: T[]
  // isGrouped: (id: keyof C) => boolean
  // addGroup: (id: keyof C) => void
  // removeGroup: (id: keyof C) => void
  // resetGroup: () => void
  // setGroup: (ids: (keyof C)[]) => void
  setRows: (rows: T[]) => void
}

export function useRows<T>(initialRows?: T[]): UseRows<T> {
  const [rows, setRows] = useState(initialRows || [] as T[])
  return {
    rows,
    setRows
  }
}
