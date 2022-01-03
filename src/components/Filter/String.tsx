import { useEffect, useState } from "react"

import { FilterMap } from "../../lib/Schema"

export type StringFilterProps = {
  id: string
  filter?: FilterMap["string"],
  onChange?: (filters?: FilterMap["string"]) => any,
  possibleValues: Set<string | null>
}

export function StringFilter({ id, filter, onChange, possibleValues }: StringFilterProps): JSX.Element {
  const [values, setValues] = useState(filter?.values || Array.from(possibleValues))
  useEffect(() => {
    const allChecked = values.length === possibleValues.size
    onChange?.(allChecked ? undefined : {values})
  }, [values])
  const addValue = (value: string | null) => setValues((prevValues) => Array.from(
    new Set([...prevValues, value])
  ))
  const removeValue = (value: string | null) => setValues((prevValues) => [...prevValues].filter(v => v !== value))
  return (
    <ul>
      {Array.from(possibleValues).map((value) => (
         <li key={value}>
          <input
            id={`${id}:${value || ""}`}
            type="checkbox"
            checked={values.indexOf(value) >= 0}
            onChange={(e) => (
              e.target.checked
                ? addValue(value)
                : removeValue(value)
            )}
          />
          <label htmlFor={`${id}:${value || ""}`}>{value}</label>
        </li>
      ))}
    </ul>
  )
}