import { emptyQuery, Filters2Filter, Query2Filters } from "."

describe("Schema/Query", () => {
  it("Filters2Filter", () => {
    expect(Filters2Filter("string0").get({ string0: { values: ["lmao"] } }))
      .toMatchObject({ values: ["lmao"] })
    expect(Filters2Filter("string1").get({string0: { values: ["lmao"] }}))
      .toBe(undefined)
    expect(Filters2Filter("string1").set({ values: ["lmao"] })({}))
      .toMatchObject({string1: {values: ["lmao"]}})
    expect(Filters2Filter("string1").set({ values: ["lmao"] })({string1: {values: []}}))
      .toMatchObject({string1: {values: ["lmao"]}})
  })

  it("Query2Filter", () => {
    const someQuery = {
      ...emptyQuery,
      filters: { string0: { values: [null] }},
    }
    expect(Query2Filters.compose(Filters2Filter("string0")).get(someQuery)).toMatchObject({ values: [null] })
    expect(Query2Filters.compose(Filters2Filter("string1")).get(someQuery)).toBe(undefined)
    expect(Query2Filters.compose(Filters2Filter("string0")).set({ values: ["lmao"] })(someQuery))
      .toMatchObject({...someQuery, filters: { string0: { values: ["lmao"]}}})
    expect(Query2Filters.compose(Filters2Filter("string0")).set(undefined)(someQuery))
      .toMatchObject({...someQuery, filters: { string0: undefined}})
  })
})
