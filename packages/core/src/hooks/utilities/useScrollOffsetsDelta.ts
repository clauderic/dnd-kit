import {useEffect, useRef} from 'react';
import {Coordinates, subtract} from '@dnd-kit/utilities';

import {defaultCoordinates} from '../../utilities';

export function useScrollOffsetsDelta(
  scrollOffsets: Coordinates,
  dependencies: any[] = []
) {
  const initialScrollOffsets = useRef<Coordinates | null>(null);

  useEffect(
    () => {
      initialScrollOffsets.current = null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies
  );

  useEffect(() => {
    const hasScrollOffsets = scrollOffsets !== defaultCoordinates;

    if (hasScrollOffsets && !initialScrollOffsets.current) {
      initialScrollOffsets.current = scrollOffsets;
    }

    if (!hasScrollOffsets && initialScrollOffsets.current) {
      initialScrollOffsets.current = null;
    }
  }, [scrollOffsets]);

  return initialScrollOffsets.current
    ? subtract(scrollOffsets, initialScrollOffsets.current)
    : defaultCoordinates;
}
