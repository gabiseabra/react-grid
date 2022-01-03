import { FilterMap } from "../../lib/Schema"

export type BoolFilterProps = {
  filter?: FilterMap["boolean"],
  onChange?: (filters?: FilterMap["boolean"]) => any
}

export function BoolFilter({ filter, onChange }: BoolFilterProps): JSX.Element {
  return <></>
}
