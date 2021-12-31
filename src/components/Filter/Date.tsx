import { TaggedFilters } from "../../lib/Schema"

export type DateFilterProps = {
  filter?: TaggedFilters["date"],
  onChange?: (filters?: TaggedFilters["date"]) => any
}

export function DateFilter({ filter, onChange }: DateFilterProps): JSX.Element {
  return <></>
}