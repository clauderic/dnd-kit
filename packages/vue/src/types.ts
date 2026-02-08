import type {ComponentPublicInstance, MaybeRefOrGetter} from 'vue';

export type MaybeRefsOrGetters<T> = {
  [K in keyof T]: MaybeRefOrGetter<T[K]>;
};

export type MaybeElement =
  | HTMLElement
  | ComponentPublicInstance
  | undefined
  | null;
