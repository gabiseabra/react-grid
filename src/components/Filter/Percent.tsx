import { FilterMap } from "../../lib/Schema"

export type PercentFilterProps = {
  filter?: FilterMap["percent"],
  onChange?: (filters?: FilterMap["percent"]) => any
}

export function PercentFilter({ filter, onChange }: PercentFilterProps): JSX.Element {
  return <></>
}