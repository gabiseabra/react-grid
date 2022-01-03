import { ColOf, ColumnTagsOf, RowOf, Table, TaggedColOf, TProxy } from "../Table"
import { ColumnsDef } from "./ColumnDefs"
import { TypeMap } from "./TypeMap"

export const Schema = new Table(new TProxy<TypeMap>(), ColumnsDef)

export type Schema = typeof Schema

export type ColId = ColumnTagsOf<Schema>

export type ColT = TaggedColOf<Schema>

export type Col = ColOf<Schema>

export type Row = RowOf<Schema>
