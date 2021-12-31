import cx from "classnames"

import { Value, ValueProps } from "."

export type ValueCellProps = {
  cell: ValueProps["cell"]
  isSelected?: boolean
  isFocused?: boolean
  className?: string
}

export function ValueCell({
  cell,
  isSelected,
  isFocused,
  className,
}: ValueCellProps): JSX.Element {
  return (
    <div className={cx("ValueCell", className, { isSelected, isFocused })}>
      <Value readOnly cell={cell} />
    </div>
  )
}
