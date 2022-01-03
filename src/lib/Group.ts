const IS_GROUP = Symbol("IS_GROUP")

let UID = 0

export type Group<T> = {
  [IS_GROUP]: true
  key: string
  entries: T[]
}

export function Group<T>(entries: T[]): Group<T> {
  return {
    [IS_GROUP]: true,
    key: `group-${UID++}`,
    entries,
  }
}

export function isGroup(a: unknown): a is Group<any> {
  return Boolean(a && (a as any)[IS_GROUP])
}

export const groupBy = <R>(ids: (keyof R)[]) => (rows: R[]): Group<R>[] => {
  if (!ids.length) return []
  const groups: Record<string, Group<R>> = {}
  for (const row of rows) {
    const key = ids.map((id) => String(row[id])).join(":")
    if (groups[key]) groups[key].entries.push(row)
    else groups[key] = Group([row])
  }
  return Object.values(groups)
}
