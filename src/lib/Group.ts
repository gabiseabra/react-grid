/**
 * Row grouping functionality
 */
import { CellOf, ColOf, RowOf, Table } from "./Table"

type MapList<T> = { [k in keyof T]: T[k][] }

type TUnion<T> = { [k in keyof T]: { type: k, value: T[k] } }[keyof T]

export type Agg<T> = (agg: TUnion<MapList<T>>) => TUnion<T>

export function getAgg<Ty, T extends Table<Ty, any>>({ id, type }: ColOf<T>, rows: RowOf<T>[], agg: Agg<Ty>): CellOf<T> {
  const value = rows.map((row) => row[id])
  return agg({ type, value })
}

const IS_GROUP = Symbol("IS_GROUP")

let UID = 0

export type Group<T> = {
  [IS_GROUP]: true
  key: string
  group: TUnion<T>[]
  entries: T[]
}

export function Group<T>(group: TUnion<T>[], entries: T[]): Group<T> {
  return {
    [IS_GROUP]: true,
    key: `group-${UID++}`,
    group,
    entries
  }
}

export function isGroup(a: unknown): a is Group<any> {
  return Boolean(a && (a as any)[IS_GROUP])
}

function eqTUnion<T>(a: TUnion<T>, b: TUnion<T>): boolean {
  return a.type == b.type && String(a.value) == String(b.value)
}

function eqTUnions<T>(as: TUnion<T>[], bs: TUnion<T>[]): boolean {
  return as.length === bs.length && !as.find((a, ix) => !eqTUnion(a, bs[ix]))
}

export function groupBy<R>(ids: (keyof R)[], rows: R[]): Group<R>[] {
  const groups: Group<R>[] = []
  for (const row of rows) {
    const group: TUnion<R>[] = []
    for (const id of ids) {
      group.push({ type: id, value: row[id] })
    }
    const match = groups.find((g) => eqTUnions(g.group, group))
    if (match) match.entries.push(row)
    else groups.push(Group(group, [row]))
  }
  return groups
}
