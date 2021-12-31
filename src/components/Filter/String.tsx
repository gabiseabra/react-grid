import { TaggedFilters } from "../../lib/Schema"

export type StringFilterProps = {
  filter?: TaggedFilters["string"],
  onChange?: (filters?: TaggedFilters["string"]) => any,
  possibleValues: Set<string | null>
}

export function StringFilter({ filter, onChange }: StringFilterProps): JSX.Element {
  return <></>
}