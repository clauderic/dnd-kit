import type {DependencyList, EffectCallback} from 'react';

export function useImmediateEffect(
  callback: EffectCallback,
  _?: DependencyList
) {
  callback();
}
