import {computed as computedSignal, ReadonlySignal} from '@preact/signals-core';

export interface ReadonlyProxyState<T> extends ReadonlySignal<T> {}

export function computed<T>(
  compute: () => T,
  comparator?: (a: T, b: T) => boolean
): ReadonlyProxyState<T> {
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
