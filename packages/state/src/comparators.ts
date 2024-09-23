export function deepEqual<T>(a: T, b: T) {
  if (a === b) {
    return true;
  }

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

  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch (e) {
    return false;
  }
}
