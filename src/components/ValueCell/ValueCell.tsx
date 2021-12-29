import cx from "classnames"

import { Value, ValueProps } from "../Types"

export type ValueCellProps = {
  cell: ValueProps["cell"]
  isGroup?: boolean
  isSelected?: boolean
  isFocused?: boolean
}

export function ValueCell({
  cell,
  isGroup,
  isSelected,
  isFocused,
}: ValueCellProps): JSX.Element {
  return (
    <div className={cx("ValueCell", { isGroup, isSelected, isFocused })}>
      <Value readOnly cell={cell} />
    </div>
  )
}
