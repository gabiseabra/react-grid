import * as Faker from "faker"
import { CellTypes } from ".";

export function arbitraryValue<T extends keyof CellTypes>(type: T, seed?: number): CellTypes[T];
export function arbitraryValue(type: keyof CellTypes, seed?: number): CellTypes[typeof type] {
  if (seed) Faker.seed(seed)
  switch (type) {
    case "string": return Faker.lorem.word();
    case "number": return Faker.datatype.number();
    case "boolean": return Faker.datatype.boolean();
    case "date": return Faker.date.future()
  }
}
