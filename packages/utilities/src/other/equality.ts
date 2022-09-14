export function isEqual<T>(a: T, b: T) {
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
      (value, index) => !isEqual(value, b[index])
    );

    return !hasDifferentValues;
  }

  return JSON.stringify(a) === JSON.stringify(b);
}
