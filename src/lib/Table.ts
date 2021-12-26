// This module provides type checking and querying of a table structure <C> against
// rows of data <R>.
export type Table<C, R>
  = { columns: C[], rows: R[] }

// Row data
export type RowT<C extends Columns<T>, T = any> = {
  [id in keyof C]: T[C[id]["type"]]
}

// Table structure represented as a map of column names to a type in T, where T is
// a proxy map of strings to js types. e.g.:
// type Types = { "string": string, "number": number }
// const columns: Columns<Types> = { a: { type: "string"}, b: { type: "number" } }
export type Columns<T> = {
  [k: string]: {
    type: keyof T
  } & Record<string, any>
}

type ColTMap<C extends Columns<T>, T = any> = { [id in keyof C]: { id: id } & C[id] }

// Sum type of columns in C, used for querying rows
export type ColT<C extends Columns<T>, T = any> = ColTMap<C, T>[keyof C]

export function ColT<C extends Columns<T>, T = any>(columns: C, id: keyof C): ColT<C, T> {
  return { id, ...columns[id] }
}

type CellTMap<T = any> = { [type in keyof T]: { type: type, value: T[type] } }

// Sum type of types in T, witness that the column matches a type in a row, used
// to narrow arbitrary db values.
export type CellT<T = any> = CellTMap<T>[keyof T]

export function getCell<K extends keyof C, C extends Columns<T>, T = any>(column: ColTMap<C, T>[K], row: RowT<C, T>): CellTMap<T>[C[K]["type"]];
export function getCell<C extends Columns<T>, T = any>(column: ColT<C, T>, row: RowT<C, T>): CellT<T> {
  return { type: column.type, value: getValue(column.id, row) }
}

// Get value of column K in a row
export function getValue<K extends keyof C, C extends Columns<T>, T = any>(id: K, row: RowT<C, T>): T[C[K]["type"]];
export function getValue<C extends Columns<T>, T = any>(id: keyof C, row: RowT<C, T>): T[keyof T] {
  return row[id]
}
