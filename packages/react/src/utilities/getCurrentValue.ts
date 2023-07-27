import type {RefObject, MutableRefObject} from 'react';

export type RefOrValue<T> =
  | T
  | RefObject<T | null | undefined>
  | MutableRefObject<T>
  | null
  | undefined;

export function getCurrentValue<T>(
  value: RefOrValue<T>
): NonNullable<T> | undefined {
  if (value == null) {
    return undefined;
  }

  if (typeof value === 'object' && 'current' in value) {
    return value.current ?? undefined;
  }

  return value;
}
