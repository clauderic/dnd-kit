import {useCallback, useEffect, useRef, useState} from 'react';
import {useLazyMemo} from '@dnd-kit/utilities';

import {getElementLayout} from '../../utilities';
import {DroppableContainers, LayoutRectMap} from '../../store/types';

const defaultValue: LayoutRectMap = new Map();

export function useLayoutRectMap(
  containers: DroppableContainers,
  disabled: boolean
) {
  const [willRecomputeLayouts, setWillRecomputeLayouts] = useState(false);
  const containersRef = useRef(containers);
  const recomputeLayouts = useCallback(() => {
    setWillRecomputeLayouts(true);
  }, []);
  const layoutRectMap = useLazyMemo<LayoutRectMap>(
    (previousValue) => {
      if (disabled) {
        return defaultValue;
      }

      if (
        !previousValue ||
        previousValue === defaultValue ||
        containersRef.current !== containers ||
        willRecomputeLayouts
      ) {
        for (let container of Object.values(containers)) {
          if (!container) {
            continue;
          }

          container.rect.current = container.node.current
            ? getElementLayout(container.node.current)
            : null;
        }

        return createLayoutRectMap(containers);
      }

      return previousValue;
    },
    [containers, disabled, willRecomputeLayouts]
  );

  useEffect(() => {
    containersRef.current = containers;
  }, [containers]);

  useEffect(() => {
    if (willRecomputeLayouts) {
      setWillRecomputeLayouts(false);
    }
  }, [willRecomputeLayouts]);

  return {layoutRectMap, recomputeLayouts, willRecomputeLayouts};
}

function createLayoutRectMap(
  containers: DroppableContainers | null
): LayoutRectMap {
  const layoutRectMap: LayoutRectMap = new Map();

  if (containers) {
    for (const container of Object.values(containers)) {
      if (!container) {
        continue;
      }

      const {id, rect, disabled} = container;

      if (disabled || rect.current == null) {
        continue;
      }

      layoutRectMap.set(id, rect.current);
    }
  }

  return layoutRectMap;
}
