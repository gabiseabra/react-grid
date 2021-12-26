export type Endo<T> = (x: T) => T

export const id = <T extends unknown>(x: T): T => x

export const filter = <T extends unknown>(fn: (x: T) => boolean) => (as: T[]): T[] => as.filter(fn)

export const append = <T extends unknown>(a: T) => (as: T[]): T[] => [...as, a]

export const partition = <T extends unknown>(fn: (a: T) => boolean) => (as: T[]): [T[], T[]] =>
  as.reduce<[T[], T[]]>(([L, R], a) => {
    if (fn(a)) return [L, append(a)(R)]
    else return [append(a)(L), R]
  }, [[], []])
