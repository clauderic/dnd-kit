import {useMemo} from 'react';

import {getScrollableAncestors} from '../../utilities';

export function useScrollableAncestors(node: HTMLElement | null) {
  return useMemo(() => getScrollableAncestors(node), [node]);
}
