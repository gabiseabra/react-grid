import { TaggedFilters } from "../../lib/Schema"

export type PercentFilterProps = {
  filter?: TaggedFilters["percent"],
  onChange?: (filters?: TaggedFilters["percent"]) => any
}

export function PercentFilter({ filter, onChange }: PercentFilterProps): JSX.Element {
  return <></>
}