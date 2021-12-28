export class TProxy<T> {
  public __Type: T
  constructor() {
    //@ts-expect-error This is a proxy type
    this.__Type = undefined
  }
}

type TypeOf<P extends TProxy<any>> = P["__Type"]

type TMap = Record<string, any>

type CTMap<T extends TMap> = Record<string, keyof T>

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
    return { id, type: this.Columns[id] }
  }

  getCell<K extends ColumnTagsOf<this>>(id: K, row: RowOf<this>): TaggedCellOf<this>[TypeTagAt<this, K>]
  getCell(id: ColumnTagsOf<this>, row: RowOf<this>): CellOf<this> {
    const value = row[id]
    const type = this.Columns[id]
    return { type, value }
  }
}

export type RowOf<T extends Table<any, any>> = {
  [k in ColumnTagsOf<T>]: TypeAt<T, k>
}

export type TaggedColOf<T extends Table<any, any>> = {
  [k in ColumnTagsOf<T>]: { id: k, type: TypeTagAt<T, k> }
}

export type ColOf<T extends Table<any, any>> = TaggedColOf<T>[ColumnTagsOf<T>]

export type TaggedCellOf<T extends Table<any, any>> = {
  [k in TypeTagsOf<T>]: { type: k, value: TypeMapOf<T>[k] }
}

export type CellOf<T extends Table<any, any>> = TaggedCellOf<T>[TypeTagsOf<T>]

export type TypeMapOf<T extends Table<any, any>> = TypeOf<T["__TProxy"]>

export type TypeTagAt<T extends Table<any, any>, K extends keyof T["Columns"]> = T["Columns"][K]
export type TypeAt<T extends Table<any, any>, K extends keyof T["Columns"]> = TypeMapOf<T>[TypeTagAt<T, K>]

export type TypeTagsOf<T extends Table<any, any>> = keyof TypeOf<T["__TProxy"]>
export type ColumnTagsOf<T extends Table<any, any>> = keyof T["Columns"]
