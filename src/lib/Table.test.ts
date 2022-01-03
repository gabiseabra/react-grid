import { ColOf, RowOf, Table,TProxy } from "./Table"

type TypeMap = {
  string: string,
  number: number,
  boolean: boolean
}

const MyTable = new Table(new TProxy<TypeMap>(), {
  a: { type: "string" },
  b: { type: "number" },
  c: { type: "boolean" },
})

describe("Table", () => {
  describe("ColOf", () => {
    it("Type checks", () => {
      const test: ColOf<typeof MyTable> = { id: "a", type: "string" }
    })

    it("Fails to type check — incorrect column type", () => {
      //@ts-expect-error —  Type '{ id: "a"; type: "number"; }' is not assignable to type ...
      const test: ColOf<typeof MyTable> = { id: "a", type: "number" }
    })

    it("Fails to type check — non existent column id", () => {
      //@ts-expect-error — Type '"d"' is not assignable to type '"a" | "b" | "c"'
      const test: ColOf<typeof MyTable> = { id: "d", type: "number" }
    })
  })

  describe("RowOf", () => {
    it("Type checks", () => {
      const test: RowOf<typeof MyTable> = { a: "eyy", b: 420, c: true }
    })

    it("Fails to type check — incorrect column type", () => {
      //@ts-expect-error Type — 'number' is not assignable to type 'boolean'
      const test: RowOf<typeof MyTable> = { a: "eyy", b: 420, c: 69 }
    })

    it("Fails to type check — non existent column id", () => {
      //@ts-expect-error — Object literal may only specify known properties, and 'd' does not exist in type ...
      const test: RowOf<typeof MyTable> = { a: "eyy", b: 420, c: true, d: 69 }
    })

    it("Fails to type check — missing column id", () => {
      //@ts-expect-error — Property 'c' is missing in type ...
      const test: RowOf<typeof MyTable> = { a: "eyy", b: 420 }
    })
  })

  describe("getCol", () => {
    it("Type checks", () => {
      const a: { id: "a", type: "string" } = MyTable.getCol("a")
      expect(a).toMatchObject({ id: "a", type: "string" })
    })

    it("Fails to type check — incorrect type assignment", () => {
      //@ts-expect-error — Type '"string"' is not assignable to type '"number"'.
      const a: { id: "a", type: "number" } = MyTable.getCol("a")
      expect(a).toMatchObject({ id: "a", type: "string" })
    })

    it("Fails to type check — invalid column id", () => {
      //@ts-expect-error — Argument of type '"d"' is not assignable to parameter of type '"a" | "b" | "c"'.
      const a: { id: "a", type: "string" } = MyTable.getCol("d")
      expect(a).toMatchObject({ id: "d", type: undefined })
    })
  })

  describe("getCell", () => {
    const row: RowOf<typeof MyTable> = {
      a: "eyy",
      b: 420,
      c: true,
    }

    it("Type checks", () => {
      const a: { type: "string", value: string } = MyTable.getCell("a", row)
      expect(a).toMatchObject({ type: "string", value: "eyy" })
    })

    it("Fails to type check — incorrect type assignment", () => {
      //@ts-expect-error — Type '"number"' is not assignable to type '"string"'
      const b0: { type: "string", value: string } = MyTable.getCell("b", row)
      expect(b0).toMatchObject({ type: "number", value: 420 })

      //@ts-expect-error — Type 'number' is not assignable to type 'string'
      const b1: { type: "string", value: number } = MyTable.getCell("b", row)
      expect(b1).toMatchObject({ type: "number", value: 420 })
    })

    it("Fails to type check — non existent column id", () => {
      //@ts-expect-error — Argument of type '"d"' is not assignable to parameter of type '"a" | "b" | "c"'
      const d = MyTable.getCell("d", row)
      expect(d).toMatchObject({ type: undefined, value: undefined })
    })
  })
})