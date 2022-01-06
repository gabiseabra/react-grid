export type Endo<T> = (x: T) => T

export const filter = <T>(fn: (x: T) => boolean) => (as: T[]): T[] => as.filter(fn)

export const append = <T>(a: T) => (as: T[]): T[] => [...as, a]

export const partition = <A, B = A>(fn: (x: A | B) => x is A) => (xs: (A | B)[]): [A[], B[]] =>
  xs.reduce<[A[], B[]]>(([A, B], x) => {
    if (fn(x)) return [[...A, x], B]
    else return [A, [...B, x]]
  }, [[], []])

export const insertBefore = (target: number) => (ix: number) => (as: any[]): any[] => {
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

export const overMap = <K, A, B>(fn: (as: [K, A][]) => [K, B][]) => (as: Map<K, A>): Map<K, B> => new Map(fn(Array.from(as)))

export const mapValues = <A, B>(fn: (a: A, ix: number) => B) => <K>(as: Map<K, A>): Map<K, B> => new Map(
  Array.from(as.entries()).map(([k, a], ix) => [k, fn(a, ix)])
)

export const mapToObject = <A, B>(fn: (a: A, ix: number) => B) => <K extends string | number | symbol>(as: Map<K, A>): { [_ in K]: B } =>
  Object.fromEntries(Array.from<[K, A]>(as).map<[K, B]>(([k, a], ix) => [k, fn(a, ix)])) as { [_ in K]: B }

export function hasKey<T, K extends keyof T>(obj: Partial<T>, key: K): obj is Partial<T> & { [k in K]: T[k] } {
  return Object.prototype.hasOwnProperty.call(obj, key)
}
