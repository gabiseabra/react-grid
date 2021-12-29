import * as Faker from "faker"

import { TypeMap } from "./TypeMap"

export function arbitraryValue<T extends keyof TypeMap>(type: T, seed?: number): TypeMap[T];
export function arbitraryValue(type: keyof TypeMap, seed?: number): TypeMap[typeof type] {
  if (seed) Faker.seed(seed)
  switch (type) {
    case "string": return Faker.lorem.word()
    case "percent": return Faker.datatype.number(100) / 100
    case "number": return Faker.datatype.number()
    case "boolean": return Faker.datatype.boolean()
    case "date": return Faker.date.future()
  }
}
