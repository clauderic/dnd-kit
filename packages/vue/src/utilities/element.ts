import type {ComponentPublicInstance, MaybeRefOrGetter} from 'vue';
import {toValue} from 'vue';
import type {MaybeElement} from '../types.ts';

export type UnRefElementReturn<T extends MaybeElement = MaybeElement> =
  T extends ComponentPublicInstance
    ? Exclude<MaybeElement, ComponentPublicInstance | null>
    : Exclude<T, null> | undefined;

export function unrefElement<T extends MaybeElement>(
  elRef: MaybeRefOrGetter<T>
): UnRefElementReturn<T> {
  const plain = toValue(elRef);
  return (plain as ComponentPublicInstance)?.$el ?? plain ?? undefined;
}
