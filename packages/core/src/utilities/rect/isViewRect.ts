import type {LayoutRect, ViewRect} from '../../types';

export function isViewRect(entry: LayoutRect | ViewRect): entry is ViewRect {
  return 'top' in entry;
}
