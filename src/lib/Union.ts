/**
 * A proxy stricture that wraps a union type to prevent from distributing 
 * n conditional types.
 * @example
 * // A distributive conditional type
 * type Example<T> = T extends (infer T) ? T : T
 * type Test = Example<W<0 | 1> | 2> // T = W<0 | 1> | 2
 */
export interface W<T> { get: T }

/**
 * Wraps each constituent of a union type in W<A> while preserving W-delimited
 * unions.
 * @example
 * type Test0 = Wrap<0 | 1>        // Test0 = W<0> | W<1>
 * type Test1 = Wrap<W<0 | 1> | 2> // Test1 = W<0 | 1> | W<2>
 */
export type Wrap<T> = T extends W<infer _> ? W<T["get"]> : W<T>

/**
 * Use with _infer_ to collapse delimited union types.
 * @example
 * type Example<T> = T extends Dist<infer T> ? T : never
 * type Test = Example<W<0 | 1> | W<1 | 2> | 1 | 2> // Test = 0 | 1 | 2
 */
export type Dist<T> = W<T> | T

/**
 * Creates a tagged union from a record
 * @example
 * type Test = Union<{
 *   A: { value: "a" }
 *   B: { value: "b" }
 * }> // Test = { type: "A", value: "a" } | { type: "B", value: "b" }
 */
export type Union<
  R extends { [_: string]: any },
  K extends string = "type"
> = { [k in keyof R]: { [_ in K]: k } & R[k] }[keyof R]

export type Get<
  U extends { [_ in K]: string },
  V extends string,
  K extends string = "type"
> = Extract<U, { [_ in K]: V }>
