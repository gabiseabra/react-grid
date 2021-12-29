type MapList<T> = { [k in keyof T]: T[k][] }

type TUnion<T> = { [k in keyof T]: { type: k, value: T[k] } }[keyof T]

export type Agg<T> = (agg: TUnion<MapList<T>>) => TUnion<T>
