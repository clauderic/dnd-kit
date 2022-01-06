import {useCallback, useEffect, useRef, useState} from 'react';
import {useLazyMemo} from '@dnd-kit/utilities';

import {Rect, getTransformAgnosticClientRect} from '../../utilities/rect';
import type {DroppableContainer, RectMap} from '../../store/types';
import type {ClientRect, UniqueIdentifier} from '../../types';

interface Arguments {
  dragging: boolean;
  dependencies: any[];
  config: Partial<DroppableMeasuring> | undefined;
}

export enum MeasuringStrategy {
  Always,
  BeforeDragging,
  WhileDragging,
}

export enum MeasuringFrequency {
  Optimized = 'optimized',
}

type MeasuringFunction = (element: HTMLElement) => ClientRect;

export interface DroppableMeasuring {
  measure: MeasuringFunction;
  strategy: MeasuringStrategy;
  frequency: MeasuringFrequency | number;
}

const defaultValue: RectMap = new Map();

const defaultConfig: DroppableMeasuring = {
  measure: getTransformAgnosticClientRect,
  strategy: MeasuringStrategy.WhileDragging,
  frequency: MeasuringFrequency.Optimized,
};

export function useDroppableMeasuring(
  containers: DroppableContainer[],
  {dragging, dependencies, config}: Arguments
) {
  const [recomputeIds, setRecomputeIds] = useState<UniqueIdentifier[] | null>(
    null
  );
  const willRecomputeRects = recomputeIds != null;
  const {frequency, measure, strategy} = {
    ...defaultConfig,
    ...config,
  };
  const containersRef = useRef(containers);
  const recomputeRects = useCallback(
    (ids: UniqueIdentifier[] = []) =>
      setRecomputeIds((value) => (value ? value.concat(ids) : ids)),
    []
  );
  const recomputeRectsTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const disabled = isDisabled();
  const rectMap = useLazyMemo<RectMap>(
    (previousValue) => {
      if (disabled && !dragging) {
        return defaultValue;
      }

      if (
        !previousValue ||
        previousValue === defaultValue ||
        containersRef.current !== containers ||
        recomputeIds != null
      ) {
        const rectMap: RectMap = new Map();

        for (let container of containers) {
          if (!container) {
            continue;
          }

          if (
            recomputeIds &&
            recomputeIds.length > 0 &&
            !recomputeIds.includes(container.id) &&
            container.rect.current
          ) {
            // This container does not need to be recomputed
            rectMap.set(container.id, container.rect.current);
            continue;
          }

          const node = container.node.current;
          const rect = node ? new Rect(measure(node), node) : null;

          container.rect.current = rect;

          if (rect) {
            rectMap.set(container.id, rect);
          }
        }

        return rectMap;
      }

      return previousValue;
    },
    [containers, dragging, disabled, measure, recomputeIds]
  );

  useEffect(() => {
    containersRef.current = containers;
  }, [containers]);

  useEffect(
    function recompute() {
      if (disabled) {
        return;
      }

      requestAnimationFrame(() => recomputeRects());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dragging, disabled]
  );

  useEffect(() => {
    if (willRecomputeRects) {
      setRecomputeIds(null);
    }
  }, [willRecomputeRects]);

  useEffect(
    function forceRecomputeLayouts() {
      if (
        disabled ||
        typeof frequency !== 'number' ||
        recomputeRectsTimeoutId.current !== null
      ) {
        return;
      }

      recomputeRectsTimeoutId.current = setTimeout(() => {
        recomputeRects();
        recomputeRectsTimeoutId.current = null;
      }, frequency);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [frequency, disabled, recomputeRects, ...dependencies]
  );

  return {
    rectMap,
    recomputeRects,
    willRecomputeRects,
  };

  function isDisabled() {
    switch (strategy) {
      case MeasuringStrategy.Always:
        return false;
      case MeasuringStrategy.BeforeDragging:
        return dragging;
      default:
        return !dragging;
    }
  }
}
