import cx from "classnames"
import { useMemo } from "react"

import { FormatOptions, formatType, TypeName, TypeOf } from "../../lib/Schema"

export type ValueCellPropsG<T extends TypeName = TypeName> = {
  type: T
  value: TypeOf<T>
  format?: FormatOptions[T]
  className?: string
  isSelected: boolean
  isFocused: boolean
}

export type ValueCellProps<T = unknown>
  = T extends TypeName
  ? ValueCellPropsG<T>
  : ValueCellPropsG

export function ValueCell<T = unknown>({
  type,
  value,
  format,
  className,
  isSelected,
  isFocused,
}: ValueCellProps<T>): JSX.Element {
  const $format = (format || FormatOptions[type]) as FormatOptions[typeof type]
  const displayValue = useMemo(() => formatType(...[
    type,
    $format,
    value,
  ] as Parameters<typeof formatType>), [
    type,
    value,
  ])
  return (
    <div className={cx("ValueCell", className, { isSelected, isFocused })}>
      {displayValue}
    </div>
  )
}
