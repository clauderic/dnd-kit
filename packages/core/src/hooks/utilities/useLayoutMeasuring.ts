import {useCallback, useEffect, useRef, useState} from 'react';
import {useLazyMemo} from '@dnd-kit/utilities';

import {getElementLayout} from '../../utilities';
import type {DroppableContainers, LayoutRectMap} from '../../store/types';

interface Arguments {
  dragging: boolean;
  dependencies: any[];
  config: Partial<LayoutMeasuring> | undefined;
}

export enum LayoutMeasuringStrategy {
  Always,
  BeforeDragging,
  WhileDragging,
}

export enum LayoutMeasuringFrequency {
  Optimized = 'optimized',
}

export interface LayoutMeasuring {
  strategy: LayoutMeasuringStrategy;
  frequency: LayoutMeasuringFrequency | number;
}

const defaultValue: LayoutRectMap = new Map();

export function useLayoutMeasuring(
  containers: DroppableContainers,
  {dragging, dependencies, config}: Arguments
) {
  const [willRecomputeLayouts, setWillRecomputeLayouts] = useState(false);
  const {frequency, strategy} = getLayoutMeasuring(config);
  const containersRef = useRef(containers);
  const recomputeLayouts = useCallback(() => setWillRecomputeLayouts(true), []);
  const recomputeLayoutsTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const disabled = isDisabled();
  const layoutRectMap = useLazyMemo<LayoutRectMap>(
    (previousValue) => {
      if (disabled && !dragging) {
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
    [containers, dragging, disabled, willRecomputeLayouts]
  );

  useEffect(() => {
    containersRef.current = containers;
  }, [containers]);

  useEffect(() => {
    if (willRecomputeLayouts) {
      setWillRecomputeLayouts(false);
    }
  }, [willRecomputeLayouts]);

  useEffect(
    function recompute() {
      if (disabled) {
        return;
      }

      requestAnimationFrame(recomputeLayouts);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dragging, disabled]
  );

  useEffect(
    function forceRecomputeLayouts() {
      if (
        disabled ||
        typeof frequency !== 'number' ||
        recomputeLayoutsTimeoutId.current !== null
      ) {
        return;
      }

      recomputeLayoutsTimeoutId.current = setTimeout(() => {
        recomputeLayouts();
        recomputeLayoutsTimeoutId.current = null;
      }, frequency);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [frequency, disabled, recomputeLayouts, ...dependencies]
  );

  return {
    layoutRectMap,
    recomputeLayouts,
    willRecomputeLayouts,
  };

  function isDisabled() {
    switch (strategy) {
      case LayoutMeasuringStrategy.Always:
        return false;
      case LayoutMeasuringStrategy.BeforeDragging:
        return dragging;
      default:
        return !dragging;
    }
  }
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

const defaultLayoutMeasuring: LayoutMeasuring = {
  strategy: LayoutMeasuringStrategy.WhileDragging,
  frequency: LayoutMeasuringFrequency.Optimized,
};

function getLayoutMeasuring(
  layoutMeasuring: Arguments['config']
): LayoutMeasuring {
  return layoutMeasuring
    ? {
        ...defaultLayoutMeasuring,
        ...layoutMeasuring,
      }
    : defaultLayoutMeasuring;
}
