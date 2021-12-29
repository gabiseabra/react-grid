type MapList<T> = { [k in keyof T]: T[k][] }

export type Value<T> = { [k in keyof T]: { type: k, value: T[k] } }[keyof T]

export type Tuple<T> = { [k in keyof T]: { type: k, a: T[k], b: T[k] } }[keyof T]

export type Agg<T> = (agg: Value<MapList<T>>) => Value<T>

export type Cmp<T> = (agg: Tuple<T>) => number
