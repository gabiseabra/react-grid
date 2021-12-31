import { TaggedFilters } from "../../lib/Schema"

export type BoolFilterProps = {
  filter?: TaggedFilters["boolean"],
  onChange?: (filters?: TaggedFilters["boolean"]) => any
}

export function BoolFilter({ filter, onChange }: BoolFilterProps): JSX.Element {
  return <></>
}
