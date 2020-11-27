import {useMemo} from 'react';

import {getElementCoordinates} from '../../utilities';
import type {PositionalClientRect} from '../../types';

export function useClientRect(
  element: Element | null
): PositionalClientRect | null {
  const clientRect = useMemo(() => {
    if (!element) {
      return null;
    }

    return getElementCoordinates(element as HTMLElement);
  }, [element]);

  return clientRect;
}
