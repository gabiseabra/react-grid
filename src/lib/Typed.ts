export type Columns<T> = {
  [k: string]: {
    type: keyof T
  } & Record<string, any>
}

export type ColTs<C extends Columns<T>, T = any> = { [id in keyof C]: { id: id } & C[id] }

export type ColT<C extends Columns<T>, T = any> = ColTs<C, T>[keyof C]

export type RowT<C extends Columns<T>, T = any> = {
  [id in keyof C]: T[C[id]["type"]]
}

export type CellTs<T = any> = {
  [type in keyof T]: { type: type, value: T[type] }
}

export type CellT<T = any> = CellTs<T>[keyof T]

export function getValue<K extends keyof C, C extends Columns<T>, T = any>(id: K, row: RowT<C, T>): T[C[K]["type"]];
export function getValue<C extends Columns<T>, T = any>(id: keyof C, row: RowT<C, T>): T[keyof T] {
  return row[id]
}

export function getCell<K extends keyof C, C extends Columns<T>, T = any>(column: ColTs<C, T>[K], row: RowT<C, T>): CellTs<T>[C[K]["type"]];
export function getCell<C extends Columns<T>, T = any>(column: ColT<C, T>, row: RowT<C, T>): CellT<T> {
  return { type: column.type, value: getValue(column.id, row) }
}

export function ColT<C extends Columns<T>, T = any>(columns: C, id: keyof C): ColT<C, T> {
  return { id, ...columns[id] }
}
