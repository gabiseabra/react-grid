export const stream = <T, A>(...fns: ((acc: A[], props: T) => A[])[]) => (props: T): A[] => fns.reduce<A[]>((acc, fn) => fn(acc, props), [])