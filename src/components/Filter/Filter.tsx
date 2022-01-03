
import { useMemo } from "react"

import { Col, ColId, Filters, Row } from "../../lib/Schema"
import { BoolFilter } from "./Bool"
import { DateFilter } from "./Date"
import { NumberFilter } from "./Number"
import { PercentFilter } from "./Percent"
import { StringFilter } from "./String"

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

type SetFilters = (update: (filters: Filters) => Filters) => any

export type FilterProps = {
  column: Col
  rows: Row[]
  filters: Filters
  setFilters: SetFilters
}

const setFilterAt = (id: ColId, setFilters: SetFilters) => (filter: Filters[typeof id]): void => setFilters((filters) => ({
  ...filters,
  [id]: filter,
}))

export function Filter({ column, rows, filters, setFilters }: FilterProps): JSX.Element {
  switch(column.type) {
    case "string":
      return (
        <PossibleValues<Row, typeof column.id> id={column.id} rows={rows}>
          {({possibleValues}) => (
            <StringFilter id={column.id} filter={filters[column.id]} onChange={setFilterAt(column.id, setFilters)} possibleValues={possibleValues} />
          )}
        </PossibleValues>
      )
    case "boolean":
      return <BoolFilter filter={filters[column.id]} onChange={setFilterAt(column.id, setFilters)} />
    case "number":
      return <NumberFilter filter={filters[column.id]} onChange={setFilterAt(column.id, setFilters)} />
    case "percent":
      return <PercentFilter filter={filters[column.id]} onChange={setFilterAt(column.id, setFilters)} />
    case "date":
      return <DateFilter filter={filters[column.id]} onChange={setFilterAt(column.id, setFilters)} />
  }
}