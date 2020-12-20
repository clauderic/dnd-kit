import {add} from '@dnd-kit/utilities';

import type {Coordinates} from '../../types';
import {getScrollCoordinates} from './getScrollCoordinates';
import {defaultCoordinates} from '../coordinates';

export function getScrollOffsets(scrollableAncestors: Element[]): Coordinates {
  return scrollableAncestors.reduce<Coordinates>((acc, node) => {
    return add(acc, getScrollCoordinates(node));
  }, defaultCoordinates);
}
