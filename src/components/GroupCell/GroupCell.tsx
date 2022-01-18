import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown"
import { faChevronUp } from "@fortawesome/free-solid-svg-icons/faChevronUp"
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome"
import cx from "classnames"
import { useMemo } from "react"

import { Agg, AggOptions, aggType, ColId, FormatOptions, formatType, Row, TypeName, TypeOf } from "../../lib/Schema"

export type GroupCellPropsG<T extends TypeName = TypeName> = {
  values: TypeOf<T>[]
  type: T
  agg?: Agg<T>
  className?: string
  isExpanded: boolean
  columnIndex: number
}

export type GroupCellProps<T = unknown>
  = T extends TypeName
  ? GroupCellPropsG<T>
  : GroupCellPropsG

export function GroupCell<T = unknown>({
  type,
  agg,
  values,
  className,
  isExpanded,
  columnIndex,
}: GroupCellProps<T>): JSX.Element {
  const $agg = (agg || AggOptions[type]) as Agg
  const displayValue = useMemo(() => aggType(...[
    type,
    $agg,
    values,
  ] as Parameters<typeof aggType>), [values, agg])
  return (
    <div className={cx("GroupCell", className)}>
      {columnIndex !== 0 ? null : (
        <Icon icon={isExpanded ? faChevronUp : faChevronDown} />
      )}
      {displayValue}
    </div>
  )
}
