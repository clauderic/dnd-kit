export function deepEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (a === null || b === null) return false;

  if (typeof a === 'function' && typeof b === 'function') {
    return a === b;
  }

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) {
      return false;
    }

    for (const value of a) {
      if (!b.has(value)) {
        return false;
      }
    }

    return true;
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      return false;
    }

    const hasDifferentValues = a.some(
      (value, index) => !deepEqual(value, b[index])
    );

    return !hasDifferentValues;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) {
      return false;
    }

    for (const [key, value] of a) {
      if (!b.has(key) || !deepEqual(value, b.get(key))) {
        return false;
      }
    }

    return true;
  }

  if (typeof a === 'object' && typeof b === 'object') {
    // Non-plain objects (RegExp, class instances, etc.) carry internal
    // state that is not captured by enumerable keys, and values of
    // different classes should never compare equal.
    const aPrototype = Object.getPrototypeOf(a);
    if (
      aPrototype !== Object.getPrototypeOf(b) ||
      (aPrototype !== null && aPrototype !== Object.prototype)
    ) {
      return false;
    }

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;

    const hasDifferentValues = aKeys.some(
      (key) => !deepEqual(a[key as keyof T], b[key as keyof T])
    );

    return !hasDifferentValues;
  }

  return false;
}
