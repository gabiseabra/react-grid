import { Dispatch, SetStateAction } from "react"

// Drop-in replacement for a setState dispatcher that traces the modified result
export const logDispatch = <A>(a: A, ...args: any[]): Dispatch<SetStateAction<A>> => (f): void => console.trace(f instanceof Function ? f(a) : f, ...args)
