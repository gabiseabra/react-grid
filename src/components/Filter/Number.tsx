import { FilterMap } from "../../lib/Schema"

export type NumberFilerProps = {
  filter?: FilterMap["number"],
  onChange?: (filters?: FilterMap["number"]) => any
}

export function NumberFilter({ filter, onChange }: NumberFilerProps): JSX.Element {
  return <></>
}