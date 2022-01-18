import { isArray } from "lodash"

/**
 * A map with access by key or index.
 */
export class IMap<K, V> implements ReadonlyMap<K, V> {
  private map: ReadonlyMap<K, V>
  private ks: K[]
  constructor(xsOrMap: [K, V][] | ReadonlyMap<K, V>) {
    this.map = isArray(xsOrMap) ? new Map(Array.from(xsOrMap)) : xsOrMap
    this.ks = isArray(xsOrMap) ? xsOrMap.map(([k]) => k) : Array.from(this.map.keys())
    this.get = this.get.bind(this)
    this.iget = this.iget.bind(this)
    this.has = this.has.bind(this)
    this.keys = this.keys.bind(this)
    this.values = this.values.bind(this)
    this.entries = this.entries.bind(this)
    this.key = this.key.bind(this)
    this.index = this.index.bind(this)
    this.forEach = this.forEach.bind(this)
  }

  get size() { return this.map.size }
  get(k: K) { return this.map.get(k) }
  iget(ix: number) { return this.get(this.ks[ix]) }
  has(k: K) { return this.map.has(k) }
  keys() { return this.map.keys() }
  values() { return this.map.values() }
  entries() { return this.map.entries() }
  key(ix: number) { return this.ks[ix] }
  index(key: K) { return this.ks.findIndex((k) => k === key) }
  forEach(fn: (V: V, K: K, _: ReadonlyMap<K, V>) => void) { return this.map.forEach(fn) }
  get [Symbol.iterator]() { return this.map[Symbol.iterator].bind(this.map) }

  static set<K, V>(K: K, V: V, ix?: number): ((_: IMap<K, V>) => IMap<K, V>) {
    return (prevMap) => {
      const entries = Array.from(prevMap.entries())
      const $ix = prevMap.has(K) ? prevMap.index(K)! : prevMap.size
      entries.splice($ix, 1)
      entries.splice(typeof ix === "undefined" ? $ix : ix, 0, [K, V])
      return new IMap(entries)
    }
  }

  static delete<K, V>(K: K): ((_: IMap<K, V>) => IMap<K, V>) {
    return (prevMap) => {
      const entries = Array.from(prevMap.entries())
      entries.splice(prevMap.index(K), 1)
      return new IMap(entries)
    }
  }

  static modify<K, V>(K: K): ((fn: (_: V) => V) => (_: IMap<K, V>) => IMap<K, V>) {
    return (fn) => (prevMap) => {
      const entries = Array.from(prevMap.entries())
      entries.splice(prevMap.index(K), 1, [K, fn(prevMap.get(K)!)])
      return new IMap(entries)
    }
  }
}
