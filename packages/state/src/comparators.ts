export function deepEqual<T>(a: T, b: T) {
  if (a === b) {
    return true;
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      return false;
    }

    if (a.length !== b.length) {
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
