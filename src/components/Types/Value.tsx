import cx from "classnames"

import { BoolValue } from "./Boolean/Value"
import { DateValue } from "./Date/Value"
import { NumberValue } from "./Number/Value"
import { StringValue } from "./String/Value"
import { TypeMap } from "./TypeMap"

export type ValueProps = {
  cell: {
    [type in keyof TypeMap]: {
      type: type,
      value: TypeMap[type],
      onChange?: (value: TypeMap[type]) => any,
    }
  }[keyof TypeMap],
  readOnly?: boolean
  className?: string
}

export function Value({ cell, ...props }: ValueProps): JSX.Element {
  props.className = cx("Types-Value", props.className)
  switch (cell.type) {
    case "boolean":
      return <BoolValue value={cell.value} onChange={cell.onChange} {...props} />
    case "string":
      return <StringValue value={cell.value} onChange={cell.onChange} {...props} />
    case "number":
      return <NumberValue value={cell.value} onChange={cell.onChange} {...props} />
    case "date":
      return <DateValue value={cell.value} onChange={cell.onChange} {...props} />
  }
}
