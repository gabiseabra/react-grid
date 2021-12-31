import { useMemo } from "react"

import { aggregate, TypeMap } from "../../lib/Schema"
import { ColOf, RowOf, Table } from "../../lib/Table"
import { ValueCell } from "../ValueCell"

export type GroupCellProps = {
  column: ColOf<Table<TypeMap, any>>,
  rows: RowOf<Table<TypeMap, any>>[]
}

export function GroupCell({
  column,
  rows,
}: GroupCellProps): JSX.Element {
  const cell = useMemo(() => aggregate({
    type: column.type,
    value: rows.map((row) => row[column.id]),
  }), [column.id, rows])
  return <ValueCell cell={cell} className="GroupCell" />
}
