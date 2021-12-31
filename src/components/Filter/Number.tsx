import { TaggedFilters } from "../../lib/Schema"

export type NumberFilerProps = {
  filter?: TaggedFilters["number"],
  onChange?: (filters?: TaggedFilters["number"]) => any
}

export function NumberFilter({ filter, onChange }: NumberFilerProps): JSX.Element {
  return <></>
}