import {toValue} from 'vue';
import type {MaybeRefsOrGetters} from '../types.ts';

export function toValueDeep<T>(input: MaybeRefsOrGetters<T>): T {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, toValue(value)])
  ) as T;
}
