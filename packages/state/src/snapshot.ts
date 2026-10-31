import {untracked} from '@preact/signals-core';

export function snapshot<T extends object>(value: T): T {
  return untracked(() => {
    const output = {} as T;

    for (const key in value) {
      // Preserve enumerable inherited values without invoking prototype setters.
      Object.defineProperty(output, key, {
        value: value[key],
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }

    return output;
  });
}
