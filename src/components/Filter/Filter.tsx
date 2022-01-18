
import { FilterOptions, FormatOptions, formatType, TypeName, TypeOf } from "../../lib/Schema"
import { Wrap } from "../../lib/Union"
import { SetFilter as SetFilterView } from "./Set"

export type FilterPropsG<T extends TypeName = TypeName> = {
  id: string
  type: T
  filter?: FilterOptions[T]
  format?: FormatOptions[T]
  getPossibleValues?: () => Set<TypeOf<T>>
  onChange
    : T extends TypeName
    ? (_?: FilterOptions[T]) => void
    : never
}

export type FilterProps<T = unknown>
  = T extends TypeName
  ? FilterPropsG<T>
  : FilterPropsG

export function Filter<T = unknown>($props: FilterProps<T>): JSX.Element {
  const props = $props as FilterProps<TypeName>
  switch(props.type) {
    case "String":
    case "MaybeString":
    case "ABC":
      type T = typeof $props.type
      const format = (a: TypeOf<T>) => formatType(...[
        props.type,
        props.format || FormatOptions[props.type],
        a
      ] as Parameters<typeof formatType>)
      return (
        <SetFilterView<TypeOf<Wrap<T>>> {...props} format={format} />
      )
    default: return <>TODO</>
  }
}
