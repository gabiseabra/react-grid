import * as Faker from "faker"

import { TypeName, TypeOf } from "./TypeDefs"

export function arbitraryValue<T extends TypeName>(type: T): TypeOf<T>;
export function arbitraryValue(type: TypeName): TypeOf<typeof type> {
  switch (type) {
    case "MaybeString":
      if (Faker.datatype.boolean()) return null
    case "String": return Faker.lorem.word()
    case "MaybeDate":
      if (Faker.datatype.boolean()) return null
    case "Date": return Faker.date.future()
    case "ABC": return Faker.datatype.number({ min: 0, max: 2 })
  }
}
