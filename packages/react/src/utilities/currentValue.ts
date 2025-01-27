import type {RefObject, MutableRefObject} from 'react';

export type Ref<T> = RefObject<T | null | undefined> | MutableRefObject<T>;

export type RefOrValue<T> = T | Ref<T> | null | undefined;

function isRef<T>(value: RefOrValue<T>): value is Ref<T> {
  return value != null && typeof value === 'object' && 'current' in value;
}

export function currentValue<T>(
  value: RefOrValue<T>
): NonNullable<T> | undefined {
  if (value == null) {
    return undefined;
  }

  if (isRef(value)) {
    return value.current ?? undefined;
  }

  return value;
}
