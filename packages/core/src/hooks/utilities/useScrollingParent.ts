import {useMemo} from 'react';

import {getScrollingParent} from '../../utilities';

export function useScrollingParent(node: HTMLElement | null) {
  return useMemo(() => {
    if (!node) {
      return null;
    }
    return getScrollingParent(node);
  }, [node]);
}
