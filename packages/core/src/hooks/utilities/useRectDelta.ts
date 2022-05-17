import type {ClientRect} from '../../types';
import {getRectDelta} from '../../utilities';

import {useInitialValue} from './useInitialValue';

export function useRectDelta(rect: ClientRect | null) {
  const initialRect = useInitialValue(rect);

  return getRectDelta(rect, initialRect);
}
