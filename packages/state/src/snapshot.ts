import {untracked} from '@preact/signals-core';

export function snapshot<T extends object>(value: T): T {
  return untracked(() => {
    const output = {} as T;

    for (const key in value) {
      output[key] = value[key];
    }

    return output;
  });
}
