export type Endo<T> = (x: T) => T

export const id = <T>(x: T): T => x

export const filter = <T>(fn: (x: T) => boolean) => (as: T[]): T[] => as.filter(fn)

export const append = <T>(a: T) => (as: T[]): T[] => [...as, a]

export const partition = <T>(fn: (a: T) => boolean) => (as: T[]): [T[], T[]] =>
  as.reduce<[T[], T[]]>(([L, R], a) => {
    if (fn(a)) return [L, append(a)(R)]
    else return [append(a)(L), R]
  }, [[], []])

export const insertBefore = (ix: number, target: number) => (as: any[]): any[] => {
  const [a] = as.splice(ix, 1)
  if (target > ix) target--
  as.splice(target, 0, a)
  return [...as]
}

export const moveToStart = (ixs: number[]) => (as: any[]): any[] => {
  const start = []
  for (const ix of ixs) {
    const [a] = as.splice(ix, 1)
    start.push(a)
  }
  return start.concat(as)
}