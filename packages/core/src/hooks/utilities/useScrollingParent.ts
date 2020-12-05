import {useMemo} from 'react';

import {getScrollingParent} from '../../utilities';

export function useScrollingParent(node: HTMLElement | null) {
  return useMemo(() => getScrollingParent(node), [node]);
}
