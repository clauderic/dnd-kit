import {useCallback, useMemo, useRef} from 'react';
import {useIsomorphicLayoutEffect} from '@dnd-kit/utilities';
import type {DeepRequired} from '@dnd-kit/utilities';

import {getRectDelta} from '../../utilities/rect';
import {getFirstScrollableAncestor} from '../../utilities/scroll';
import {useInitialValue} from '../../hooks/utilities';
import type {ClientRect} from '../../types';
import {defaultMeasuringConfiguration} from './defaults';
import type {MeasuringFunction, MeasuringConfiguration} from './types';

export function useMeasuringConfiguration(
  config: MeasuringConfiguration | undefined
): DeepRequired<MeasuringConfiguration> {
  return useMemo(
    () => ({
      draggable: {
        ...defaultMeasuringConfiguration.draggable,
        ...config?.draggable,
      },
      droppable: {
        ...defaultMeasuringConfiguration.droppable,
        ...config?.droppable,
      },
      dragOverlay: {
        ...defaultMeasuringConfiguration.dragOverlay,
        ...config?.dragOverlay,
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config?.draggable, config?.droppable, config?.dragOverlay]
  );
}

interface Options {
  disabled?: boolean;
  measure: MeasuringFunction;
}

export function useLayoutShiftScrollCompensation(
  node: HTMLElement | null,
  {disabled, measure}: Options
) {
  const initialNode = useInitialValue(node);
  const initialRect = useRef<ClientRect | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!initialNode) {
      initialRect.current = null;
      return;
    }

    if (disabled || !initialRect.current) {
      return;
    }

    const rect = measure(initialNode);
    const rectDelta = getRectDelta(rect, initialRect.current);

    if (rectDelta.x > 0 || rectDelta.y > 0) {
      const firstScrollableAncestor = getFirstScrollableAncestor(initialNode);

      if (firstScrollableAncestor) {
        firstScrollableAncestor.scrollBy({
          top: rectDelta.y,
          left: rectDelta.x,
        });
      }
    }
  }, [disabled, initialNode, measure]);

  const measureRect = useCallback(
    (node: HTMLElement) => {
      initialRect.current = measure(node);
    },
    [measure]
  );

  return measureRect;
}
