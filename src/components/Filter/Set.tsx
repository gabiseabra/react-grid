import { RefObject, useEffect, useMemo, useRef, useState } from "react"

import { SetFilter as SetFilterT } from "../../lib/Schema"
import { W } from "../../lib/Union"

export type SetFilterPropsG<T> ={
  id: string
  format: (_: T) => string,
  filter?: SetFilterT<T>,
  onChange: (filter?: SetFilterT<T>) => void,
  getPossibleValues?: () => Set<T>
}

/**
 * Distributes union types over SetFilterPropsG, so:
 * SetFilterProps<1 | 2> = SetFilterPropsG<1> | SetFilterPropsG<2>
 * Types can be grouped with [] to avoid distributing:
 * SetFilterProps<[1 | 2] | 3> = SetFilterPropsG<1 | 2> | SetFilterPropsG<3>
 */
export type SetFilterProps<T>
  = T extends W<infer T>
  ? SetFilterPropsG<T>
  : SetFilterPropsG<T>

export function SetFilter<T>({ id, filter, format, onChange, getPossibleValues }: SetFilterProps<T>): JSX.Element {
  const possibleValues = useMemo(() => (getPossibleValues?.() || new Set([])) as Set<T>, [])
  const checkAllRef: RefObject<HTMLInputElement> = useRef(null)
  const possibleValuesArray = useMemo(() => Array.from(possibleValues).sort(), [possibleValues])
  const initialValue = filter?.values || possibleValuesArray
  const [values, setValues] = useState(initialValue)

  useEffect(() => {
    const allChecked = values.length === possibleValuesArray.length
    const noneChecked = values.length === 0
    const nextFilter = allChecked ? undefined : {op: "IN", values} as SetFilterT<T>
    if (nextFilter?.values !== filter?.values) onChange(nextFilter)
    if (checkAllRef.current) {
      checkAllRef.current.indeterminate = !(allChecked || noneChecked)
      checkAllRef.current.checked = !noneChecked
    }
  }, [values])

  const addValue = (value: T) => setValues((prevValues) => Array.from(
    new Set([...prevValues, value])
  ))

  const removeValue = (value: T) => setValues((prevValues) => [...prevValues].filter(v => v !== value))

  return (
    <div className="Filter SetFilter">
      <header>
        <input
          ref={checkAllRef}
          id={`${id}:all`}
          type="checkbox"
          onChange={(e) => setValues(e.target.checked ? possibleValuesArray : [])}
        />
        <label htmlFor={`${id}:all`}>Select all</label>
      </header>
      <ul>
        {possibleValuesArray.map((value) => (
          <li key={String(value)}>
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
            <label htmlFor={`${id}:v:${value || ""}`}>{format(value)}</label>
          </li>
        ))}
      </ul>
    </div>
  )
}