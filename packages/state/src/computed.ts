import {
  computed as computedSignal,
  type ReadonlySignal,
} from '@preact/signals-core';

export function computed<T>(
  compute: () => T,
  comparator?: (a: T, b: T) => boolean
): ReadonlySignal<T> {
  if (comparator) {
    let previousValue: T | undefined;

    return computedSignal(() => {
      const value = compute();

      if (value && previousValue && comparator(previousValue, value)) {
        return previousValue;
      }

      previousValue = value;
      return value;
    });
  }

  return computedSignal<T>(compute);
}
