import { IMap } from "./IMap"
import { Col, ColId, Row, TypeName } from "./Schema"
import { arbitraryValue } from "./Schema/gen"

const TypeNames: TypeName[] = [
  "String",
  "MaybeString",
  "Date",
  "MaybeDate",
  "ABC",
]

export const Columns: IMap<string, Col> = new IMap(
  TypeNames.flatMap((type) => Array(10).fill(null).map((_, ix) => [
    `${type}_${ix}`,
    {
      type,
      id: `${type}_${ix}`,
      label: `${type}_${ix}`,
      width: 130,
    },
  ]) as [string, Col][])
)

export const Rows: Row[] = Array(100000).fill(null).map(() => {
  return Array.from(Columns).reduce<Row>((row, [id, { type }]) => ({
    ...row,
    [id]: arbitraryValue(type),
  }), {} as Row)
})

export const getType = (id: ColId): TypeName => Columns.get(id)!.type
