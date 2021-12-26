import { CellT, ColT, getCell, getValue, RowT } from "./Table"

type TypeMap = {
  string: string,
  number: number,
  boolean: boolean
}

const Cols = {
  a: { type: "string" },
  b: { type: "number" },
  c: { type: "boolean" },
} as const

const columns: ColT<typeof Cols, TypeMap>[] = [
  { id: "a", type: "string" },
  { id: "b", type: "number" },
  { id: "c", type: "boolean" },
]

const rows: RowT<typeof Cols, TypeMap>[] = [
  { a: "eyy", b: 123, c: true },
  { a: "eyy", b: 123, c: true },
]

describe('Table', () => {
  describe("ColT", () => {
    it("Type checks", () => {
      const test: ColT<typeof Cols, TypeMap> = { id: "a", type: "string" }
    })

    it("Fails to type check — incorrect column type", () => {
      // @ts-expect-error — Type '{ id: "a"; type: "number"; }' is not assignable to type '{ id: "c"; } & { readonly type: "boolean"; }'
      const test: ColT<typeof Cols, TypeMap> = { id: "a", type: "number" }
    })

    it("Fails to type check — non existent column id", () => {
      // @ts-expect-error — Type '"d"' is not assignable to type '"a" | "b" | "c"'
      const test: ColT<typeof Cols, TypeMap> = { id: "d", type: "number" }
    })
  })

  describe("RowT", () => {
    it("Type checks", () => {
      const test: RowT<typeof Cols, TypeMap> = { a: "eyy", b: 420, c: true }
    })

    it("Fails to type check — incorrect column type", () => {
      // @ts-expect-error Type — 'number' is not assignable to type 'boolean'
      const test: RowT<typeof Cols, TypeMap> = { a: "eyy", b: 420, c: 69 }
    })

    it("Fails to type check — non existent column id", () => {
      // @ts-expect-error — Object literal may only specify known properties, and 'd' does not exist in type ...
      const test: RowT<typeof Cols, TypeMap> = { a: "eyy", b: 420, c: true, d: 69 }
    })

    it("Fails to type check — missing column id", () => {
      // @ts-expect-error — Property 'c' is missing in type ...
      const test: RowT<typeof Cols, TypeMap> = { a: "eyy", b: 420 }
    })
  })

  describe("getValue", () => {
    it("Type checks", () => {
      const a: string = getValue("a", rows[0])
      expect(typeof a).toBe("string")
    })

    it("Fails to type check — incorrect type assignment", () => {
      // @ts-expect-error — Type 'number' is not assignable to type 'string'
      const b: string = getValue("b", rows[0])
      expect(typeof b).toBe("number")
    })

    it("Fails to type check — non existent column id", () => {
      // @ts-expect-error — Argument of type '"d"' is not assignable to parameter of type '"a" | "b" | "c"'
      const d: string = getValue("d", rows[0])
      expect(typeof d).toBe("undefined")
    })
  })

  describe("getCell", () => {
    it("Type checks", () => {
      const a: CellT<TypeMap> = getCell(columns[0], rows[0])
      expect(a.type).toBe("string")
      expect(typeof a.value).toBe("string")

      const b: { type: "number", value: number } = getCell({ id: "b", type: "number" }, rows[0])
      expect(b.type).toBe("number")
      expect(typeof b.value).toBe("number")
    })

    it("Fails to type check — incorrect type assignment", () => {
      // @ts-expect-error — Type '{ type: "string"; value: string; } | { type: "number"; value: number; } | { type: "boolean"; value: boolean; }' is not assignable to type '{ type: "string"; value: string; }'
      const a: { type: "string", value: string } = getCell(columns[0], rows[0])
      expect(typeof a.value).toBe("string")

      // @ts-expect-error — Type '{ type: "number"; value: number; }' is not assignable to type '{ type: "string"; value: string; }'
      const b: { type: "string", value: string } = getCell({ id: "b", type: "number" }, rows[0])
      expect(typeof b.value).toBe("number")
    })

    it("Fails to type check — incorrect column type", () => {
      // @ts-expect-error — Type '"string"' is not assignable to type '"boolean"'
      const c = getCell({ id: "c", type: "string" }, rows[0])
      expect(typeof c.value).toBe("boolean")
    })

    it("Fails to type check — non existent column id", () => {
      // @ts-expect-error — Type '"d"' is not assignable to type '"a" | "b" | "c"'
      const d = getCell({ id: "d", type: "string" }, rows[0])
      expect(typeof d.value).toBe("undefined")
    })
  })
})