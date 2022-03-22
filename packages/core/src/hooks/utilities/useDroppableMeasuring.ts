import {useCallback, useEffect, useRef, useState} from 'react';
import {useLatestValue, useLazyMemo} from '@dnd-kit/utilities';

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
  const [
    containerIdsScheduledForMeasurement,
    setContainerIdsScheduledForMeasurement,
  ] = useState<UniqueIdentifier[] | null>(null);
  const measuringScheduled = containerIdsScheduledForMeasurement != null;
  const {frequency, measure, strategy} = {
    ...defaultConfig,
    ...config,
  };
  const containersRef = useRef(containers);
  const disabled = isDisabled();
  const disabledRef = useLatestValue(disabled);
  const measureDroppableContainers = useCallback(
    (ids: UniqueIdentifier[] = []) => {
      if (disabledRef.current) {
        return;
      }

      setContainerIdsScheduledForMeasurement((value) =>
        value ? value.concat(ids) : ids
      );
    },
    [disabledRef]
  );
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const droppableRects = useLazyMemo<RectMap>(
    (previousValue) => {
      if (disabled && !dragging) {
        return defaultValue;
      }

      const ids = containerIdsScheduledForMeasurement;

      if (
        !previousValue ||
        previousValue === defaultValue ||
        containersRef.current !== containers ||
        ids != null
      ) {
        const map: RectMap = new Map();

        for (let container of containers) {
          if (!container) {
            continue;
          }

          if (
            ids &&
            ids.length > 0 &&
            !ids.includes(container.id) &&
            container.rect.current
          ) {
            // This container does not need to be re-measured
            map.set(container.id, container.rect.current);
            continue;
          }

          const node = container.node.current;
          const rect = node ? new Rect(measure(node), node) : null;

          container.rect.current = rect;

          if (rect) {
            map.set(container.id, rect);
          }
        }

        return map;
      }

      return previousValue;
    },
    [
      containers,
      containerIdsScheduledForMeasurement,
      dragging,
      disabled,
      measure,
    ]
  );

  useEffect(() => {
    containersRef.current = containers;
  }, [containers]);

  useEffect(
    () => {
      if (disabled) {
        return;
      }

      requestAnimationFrame(() => measureDroppableContainers());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dragging, disabled]
  );

  useEffect(() => {
    if (measuringScheduled) {
      setContainerIdsScheduledForMeasurement(null);
    }
  }, [measuringScheduled]);

  useEffect(
    () => {
      if (
        disabled ||
        typeof frequency !== 'number' ||
        timeoutId.current !== null
      ) {
        return;
      }

      timeoutId.current = setTimeout(() => {
        measureDroppableContainers();
        timeoutId.current = null;
      }, frequency);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [frequency, disabled, measureDroppableContainers, ...dependencies]
  );

  return {
    droppableRects,
    measureDroppableContainers,
    measuringScheduled,
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
