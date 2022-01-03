import { useMemo } from "react"

import { aggregate, Col, Row, Schema } from "../../lib/Schema"
import { ValueCell } from "../ValueCell"

export type GroupCellProps = {
  column: Col,
  rows: Row[]
}

export function GroupCell({
  column,
  rows,
}: GroupCellProps): JSX.Element {
  const cell = useMemo(() => aggregate(Schema.getCellArray(column.id, rows)), [column.id, rows])
  return <ValueCell cell={cell} className="GroupCell" />
}
