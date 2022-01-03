import { FilterMap } from "../../lib/Schema"

export type DateFilterProps = {
  filter?: FilterMap["date"],
  onChange?: (filters?: FilterMap["date"]) => any
}

export function DateFilter({ filter, onChange }: DateFilterProps): JSX.Element {
  return <></>
}