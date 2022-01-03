import {none,some} from "fp-ts/Option"
import { pipe } from "lodash/fp"
import {Lens,Prism} from "monocle-ts"

export type Endo<T> = (x: T) => T

export type Dist<T> = T[keyof T]

export const id = <T>(x: T): T => x

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

export const overMap = (fn: (as: any[]) => any[]) => (as: Map<any, any>): Map<any, any> => new Map(fn(Array.from(as)))

// https://github.com/gcanti/monocle-ts/issues/22#issuecomment-479763960
export const fromDiscriminatedUnion = <U extends {type: string | number | symbol}>() =>
  <Type extends U["type"]>(type: Type) =>
    new Prism<U, Extract<U, {type: Type}>>(
      union => (union.type === type ? some(union) : none as any),
      s => s
    )
