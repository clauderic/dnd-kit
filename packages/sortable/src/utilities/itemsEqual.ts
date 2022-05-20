import type {UniqueIdentifier} from '@dnd-kit/core';

export function itemsEqual(a: UniqueIdentifier[], b: UniqueIdentifier[]) {
  if (a === b) {
    return true;
  }

  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}
