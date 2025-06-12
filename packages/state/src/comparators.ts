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

  if (typeof a === 'object' && typeof b === 'object') {
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
