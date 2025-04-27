export class WeakStore<
  WeakKey extends object,
  Key extends string | number | symbol,
  Value extends Record<Key, any>,
> {
  #store = new WeakMap<WeakKey, Map<Key, Value>>();

  get(key: WeakKey | undefined, id: Key) {
    return key ? this.#store.get(key)?.get(id) : undefined;
  }

  set(key: WeakKey | undefined, id: Key, value: Value) {
    if (!key) return;
    if (!this.#store.has(key)) this.#store.set(key, new Map());

    return this.#store.get(key)?.set(id, value);
  }

  clear(key: WeakKey | undefined) {
    return key ? this.#store.get(key)?.clear() : undefined;
  }
}
