
import { useMemo } from "react"
import { UseFilters } from "../../lib/hooks/useFilter"

import { Col, Row, Schema,TaggedFilters, TypeMap } from "../../lib/Schema"
import { ColOf, ColumnTagsOf, RowOf, Table, TypeTagAt } from "../../lib/Table"
import { BoolFilter, BoolFilterProps } from "./Bool"
import { DateFilter, DateFilterProps } from "./Date"
import { NumberFilerProps, NumberFilter } from "./Number"
import { PercentFilter, PercentFilterProps } from "./Percent"
import { StringFilter, StringFilterProps } from "./String"

type TaggedPossibleValuesProps<R> = {
  [k in keyof R]: {
    id: k
    rows: R[]
    children: (props: { possibleValues: Set<R[k]> }) => JSX.Element
  }
}

function PossibleValues<R, id extends keyof R>({id, rows, children}: TaggedPossibleValuesProps<R>[id]): JSX.Element
function PossibleValues<R>({id, rows, children}: TaggedPossibleValuesProps<R>[keyof R]): JSX.Element {
  const possibleValues: Set<R[typeof id]> = useMemo(() => new Set(rows.map((row) => row[id])), [rows, id])
  return children({ possibleValues })
}


export type FilterProps = {
  column: Col
  rows: Row[]
  filters: UseFilters<typeof Schema, TaggedFilters>
}

export function Filter({ column, rows, filters: { filters, setFilter } }: FilterProps): JSX.Element {
  switch(column.type) {
    case "string":
      return (
        <PossibleValues<Row, typeof column.id> id={column.id} rows={rows}>
          {({possibleValues}) => (
            <StringFilter filter={filters[column.id]} onChange={setFilter(column.id)} possibleValues={possibleValues} />
          )}
        </PossibleValues>
      )
    case "boolean":
      return <BoolFilter filter={filters[column.id]} onChange={setFilter(column.id)} />
    case "number":
      return <NumberFilter filter={filters[column.id]} onChange={setFilter(column.id)} />
    case "percent":
      return <PercentFilter filter={filters[column.id]} onChange={setFilter(column.id)} />
    case "date":
      return <DateFilter filter={filters[column.id]} onChange={setFilter(column.id)} />
  }
}