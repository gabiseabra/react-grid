import { RefObject, useEffect, useMemo, useRef, useState } from "react"

import { FilterMap } from "../../lib/Schema"

export type StringFilterProps = {
  id: string
  filter?: FilterMap["string"],
  onChange?: (filters?: FilterMap["string"]) => any,
  possibleValues: Set<string | null>
}

export function StringFilter({ id, filter, onChange, possibleValues }: StringFilterProps): JSX.Element {
  const checkAllRef: RefObject<HTMLInputElement> = useRef(null)
  const possibleValuesArray = useMemo(() => Array.from(possibleValues).sort(), [possibleValues])
  const initialValue = filter?.values || possibleValuesArray
  const [values, setValues] = useState(initialValue)

  useEffect(() => {
    const allChecked = values.length === possibleValuesArray.length
    const noneChecked = values.length === 0
    const nextFilter = allChecked ? undefined : {values}
    if (nextFilter?.values !== filter?.values) onChange?.(nextFilter)
    if (checkAllRef.current) {
      checkAllRef.current.indeterminate = !(allChecked || noneChecked)
      checkAllRef.current.checked = !noneChecked
    }
  }, [values])

  const addValue = (value: string | null) => setValues((prevValues) => Array.from(
    new Set([...prevValues, value])
  ))

  const removeValue = (value: string | null) => setValues((prevValues) => [...prevValues].filter(v => v !== value))

  return (
    <div className="Filter StringFilter">
      <div className="StringFilter-Controls">
        <input
          ref={checkAllRef}
          id={`${id}:all`}
          type="checkbox"
          onChange={(e) => setValues(e.target.checked ? possibleValuesArray : [])}
        />
        <label htmlFor={`${id}:all`}>Select all</label>
      </div>
      <ul>
        {possibleValuesArray.map((value) => (
          <li key={value}>
            <input
              id={`${id}:v:${value || ""}`}
              type="checkbox"
              checked={values.indexOf(value) >= 0}
              onChange={(e) => (
                e.target.checked
                  ? addValue(value)
                  : removeValue(value)
              )}
            />
            <label htmlFor={`${id}:v:${value || ""}`}>{value}</label>
          </li>
        ))}
      </ul>
    </div>
  )
}