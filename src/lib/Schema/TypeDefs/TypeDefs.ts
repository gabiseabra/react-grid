import { W } from "../../Union"

export enum ABC { A = 0, B, C }

export type TypeDefs = {
  String: string
  MaybeString: string | null
  Date: Date
  MaybeDate: Date | null
  ABC: ABC
}

export type TypeName = keyof TypeDefs

export type TypeOf<T>
  = T extends W<TypeName>
  ? W<TypeDefs[T["get"]]>
  : T extends TypeName
  ? TypeDefs[T]
  : never

type TMap<T = any> = { [_ in TypeName]: T }

export type Args<M extends TMap, T extends TypeName = TypeName>
  = T extends TypeName ? [T, ...Parameters<M[T]>] : never

export function mapType<M extends TMap>(M: M): ((...args: Args<M>) => ReturnType<M[typeof args[0]]>);
export function mapType<M extends TMap>(M: M): (<T extends TypeName>(type: T, ...args: Parameters<M[T]>) => ReturnType<M[T]>) {
  return (type, ...args) => M[type](...args)
}
