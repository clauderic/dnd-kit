import type {ClientRect} from '../../types';
import {useInitialValue} from './useInitialValue';

export function useInitialRect(
  node: HTMLElement | null,
  measure: (node: HTMLElement) => ClientRect
) {
  return useInitialValue(node, measure);
}
