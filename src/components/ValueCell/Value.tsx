import cx from "classnames"

import { TypeMap } from "../../lib/Schema"
import { BoolValue } from "./Bool"
import { DateValue } from "./Date"
import { NumberValue } from "./Number"
import { PercentValue } from "./Percent"
import { StringValue } from "./String"

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
  switch (cell.type) {
    case "boolean":
      return <BoolValue value={cell.value} onChange={cell.onChange} {...props} />
    case "string":
      return <StringValue value={cell.value} onChange={cell.onChange} {...props} />
    case "number":
      return <NumberValue value={cell.value} onChange={cell.onChange} {...props} />
    case "percent":
      return <PercentValue value={cell.value} onChange={cell.onChange} {...props} />
    case "date":
      return <DateValue value={cell.value} onChange={cell.onChange} {...props} />
  }
}
