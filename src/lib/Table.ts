import { isArray } from "lodash"

export class TProxy<T> {
  public __Type: T
  constructor() {
    //@ts-expect-error This is a proxy type
    this.__Type = undefined
  }
}

type TypeOf<P extends TProxy<any>> = P["__Type"]

type TMap = Record<string, any>

type CTMap<T extends TMap> = Record<string, { type: keyof T }>

/**
 * This class provides type inference and querying methods for handling tabular data.
 * The generic types `T` and `C` respectively stand for a map of type names to
 * JS types and a map of column names to type names. The type of rows corresponding
 * to the table's definition is obtained by `RowOf<Table<*, *>>`.
 * This is to enable narrowing of arbitrary columns and cells to their respective types.
 */
export class Table<T, C extends CTMap<T>> {
  constructor(
    public __TProxy: TProxy<T>,
    public Columns: C
  ) { }

  getCol<K extends ColumnTagsOf<this>>(id: K): TaggedColOf<this>[K] {
    return { ...this.Columns[id], id }
  }

  getCell<id extends ColumnTagsOf<this>>(id: id, row: RowOf<this>): TaggedCellOf<this>[TypeTagAt<this>[id]]
  getCell(id: ColumnTagsOf<this>, row: RowOf<this>): CellOf<this> {
    return { type: this.Columns[id].type, value: row[id] }
  }

  getCellArray<id extends ColumnTagsOf<this>>(id: id, rows: RowOf<this>[]): TaggedCellArrayOf<this>[TypeTagAt<this>[id]]
  getCellArray(id: ColumnTagsOf<this>, rows: RowOf<this>[]): CellArrayOf<this> {
    return { type: this.Columns[id].type, values: rows.map((row) => row[id]) }
  }

  mapCell<id extends ColumnTagsOf<this>, R extends RowMapOf<this>>(id: id, map: R): CellMapOf<this, R>[id] {
    return (Object.keys(map) as (keyof R)[]).reduce((acc, key) => ({
      ...acc,
      [key]:
        isArray(map[key])
          ? this.getCellArray(id, map[key] as RowOf<this>[]).values
          : this.getCell(id, map[key] as RowOf<this>).value
    }), { type: this.getCol(id).type } as CellMapOf<this, R>[id])
  }

  get columnTags(): ColumnTagsOf<this>[] {
    return Object.keys(this.Columns)
  }
}

type RowMapOf<T extends Table<any, any>> = Record<string, RowOf<T> | RowOf<T>[]>
type CellMapOf<T extends Table<any, any>, R extends RowMapOf<T>> = {
  [id in ColumnTagsOf<T>]: { type: TypeTagAt<T>[id] } & {
    [k in keyof R]
      : R[k] extends RowOf<T>[]
      ? TypeAt<T>[id][]
      : TypeAt<T>[id]
  }
}

export type RowOf<T extends Table<any, any>> = {
  [id in ColumnTagsOf<T>]: TypeAt<T>[id]
}

export type TaggedColOf<T extends Table<any, any>> = {
  [k in ColumnTagsOf<T>]: { id: k } & T["Columns"][k]
}

export type ColOf<T extends Table<any, any>> = TaggedColOf<T>[ColumnTagsOf<T>]

export type TaggedCellOf<T extends Table<any, any>> = {
  [k in TypeTagsOf<T>]: { type: k, value: TypeMapOf<T>[k] }
}

export type CellOf<T extends Table<any, any>> = TaggedCellOf<T>[TypeTagsOf<T>]

export type TaggedCellArrayOf<T extends Table<any, any>> = {
  [k in TypeTagsOf<T>]: { type: k, values: TypeMapOf<T>[k][] }
}

export type CellArrayOf<T extends Table<any, any>> = TaggedCellArrayOf<T>[TypeTagsOf<T>]

export type TypeMapOf<T extends Table<any, any>> = TypeOf<T["__TProxy"]>

export type TypeTagAt<T extends Table<any, any>> = { [id in ColumnTagsOf<T>]: T["Columns"][id]["type"] }
export type TypeAt<T extends Table<any, any>> = { [id in ColumnTagsOf<T>]: TypeMapOf<T>[TypeTagAt<T>[id]] }

export type TypeTagsOf<T extends Table<any, any>> = keyof TypeOf<T["__TProxy"]>
export type ColumnTagsOf<T extends Table<any, any>> = keyof T["Columns"]
