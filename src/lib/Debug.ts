import { Dispatch, SetStateAction } from "react"

export const logDispatch = <A>(a: A, ...args: any[]): Dispatch<SetStateAction<A>> => (f): void => console.trace(f instanceof Function ? f(a) : f, ...args)
