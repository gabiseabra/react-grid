import { emptyQuery, Filters2Filter, GroupBy2IsGrouped, OrderBy2Sorting, Query, Query2Filters, Query2GroupBy, Query2OrderBy } from "."

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

  it("OrderBy2Sorting", () => {
    expect(OrderBy2Sorting("string0").get([["string1", "ASC"]])).toBe(undefined)
    expect(OrderBy2Sorting("string0").get([["string1", "ASC"], ["string0", "ASC"]]))
      .toMatchObject({ priority: 1, order: "ASC" })
    expect(OrderBy2Sorting("string0").set({ priority: 0, order: "DESC" })([["string1", "ASC"], ["string0", "ASC"]]))
      .toMatchObject([["string0", "DESC"], ["string1", "ASC"]])
    expect(OrderBy2Sorting("string0").set(undefined)([["string1", "ASC"], ["string0", "ASC"]]))
      .toMatchObject([["string1", "ASC"]])
  })

  it("GroupBy2IsGrouped", () => {
    expect(GroupBy2IsGrouped("string0").get(["string1"])).toBe(false)
    expect(GroupBy2IsGrouped("string0").get(["string0"])).toBe(true)
    expect(GroupBy2IsGrouped("string0").set(false)(["string0"])).toMatchObject([])
    expect(GroupBy2IsGrouped("string0").set(true)(["string1"])).toMatchObject(["string1", "string0"])
  })

  it("Query2Filter", () => {
    const someQuery: Query = {
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

  it("Query2OrderBy", () => {
    const someQuery: Query = {
      ...emptyQuery,
      orderBy: [["string0", "ASC"]],
    }

    expect(Query2OrderBy.compose(OrderBy2Sorting("string0")).get(someQuery))
      .toMatchObject({ priority: 0, order: "ASC" })
    expect(Query2OrderBy.compose(OrderBy2Sorting("string1")).get(someQuery))
      .toBe(undefined)
    expect(Query2OrderBy.compose(OrderBy2Sorting("string0")).set({priority: 0, order: "DESC"})(someQuery))
      .toMatchObject({...someQuery, orderBy: [["string0", "DESC"]]})
    expect(Query2OrderBy.compose(OrderBy2Sorting("string0")).set(undefined)(someQuery))
      .toMatchObject({...someQuery, orderBy: []})
  })

  it("Query2GroupBy", () => {
    const someQuery: Query = {
      ...emptyQuery,
      groupBy: ["string0"],
    }

    expect(Query2GroupBy.compose(GroupBy2IsGrouped("string0")).get(someQuery)).toBe(true)
    expect(Query2GroupBy.compose(GroupBy2IsGrouped("string1")).get(someQuery)).toBe(false)
    expect(Query2GroupBy.compose(GroupBy2IsGrouped("string1")).set(true)(someQuery))
      .toMatchObject({...someQuery, groupBy: ["string0", "string1"]})
    expect(Query2GroupBy.compose(GroupBy2IsGrouped("string0")).set(false)(someQuery))
      .toMatchObject({...someQuery, groupBy: []})
  })
})
