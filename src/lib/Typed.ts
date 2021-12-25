export type Columns<T> = {
  [k: string]: {
    type: keyof T
  } & Record<string, any>
}

type ColTMap<C extends Columns<T>, T = any> = { [id in keyof C]: { id: id } & C[id] }

export type ColT<C extends Columns<T>, T = any> = ColTMap<C, T>[keyof C]

export type RowT<C extends Columns<T>, T = any> = {
  [id in keyof C]: T[C[id]["type"]]
}

type CellTMap<T = any> = {
  [type in keyof T]: { type: type, value: T[type] }
}

export type CellT<T = any> = CellTMap<T>[keyof T]

export function getValue<K extends keyof C, C extends Columns<T>, T = any>(id: K, row: RowT<C, T>): T[C[K]["type"]];
export function getValue<C extends Columns<T>, T = any>(id: keyof C, row: RowT<C, T>): T[keyof T] {
  return row[id]
}

export function getCell<K extends keyof C, C extends Columns<T>, T = any>(column: ColTMap<C, T>[K], row: RowT<C, T>): CellTMap<T>[C[K]["type"]];
export function getCell<C extends Columns<T>, T = any>(column: ColT<C, T>, row: RowT<C, T>): CellT<T> {
  return { type: column.type, value: getValue(column.id, row) }
}

export function ColT<C extends Columns<T>, T = any>(columns: C, id: keyof C): ColT<C, T> {
  return { id, ...columns[id] }
}
