import {useMemo} from 'react';
import type {Coordinates} from '../../types';

export function useFindElementFromPoint(
  coordinates: Coordinates,
  document: Document | undefined
) {
  // To-do: This is expensive and needs to be debounced
  return useMemo(() => {
    if (!document) {
      return null;
    }

    return document.elementFromPoint(coordinates.x, coordinates.y);
  }, [coordinates.x, coordinates.y, document]);
}
