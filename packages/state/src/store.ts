export function createStore<
  WeakKey extends object,
  Key extends string | number | symbol,
  Value extends Record<Key, any>,
>() {
  const store = new WeakMap<WeakKey, Map<Key, Value>>();

  return {
    get: (key: WeakKey | undefined, id: Key) =>
      key ? store.get(key)?.get(id) : undefined,
    set: (key: WeakKey | undefined, id: Key, value: Value) =>
      key ? store.get(key)?.set(id, value) : undefined,
    clear: (key: WeakKey | undefined) =>
      key ? store.get(key)?.clear() : undefined,
  };
}
