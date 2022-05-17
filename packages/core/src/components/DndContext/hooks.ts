import {useMemo, useRef} from 'react';
import {useIsomorphicLayoutEffect} from '@dnd-kit/utilities';
import type {DeepRequired} from '@dnd-kit/utilities';

import {getRectDelta} from '../../utilities/rect';
import {getFirstScrollableAncestor} from '../../utilities/scroll';
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
  disabled: boolean;
  element: HTMLElement | null;
  initialRect: ClientRect | null;
  measure: MeasuringFunction;
}

export function useLayoutShiftScrollCompensation({
  element,
  measure,
  initialRect,
  disabled,
}: Options) {
  const initialized = useRef(false);

  useIsomorphicLayoutEffect(() => {
    if (disabled) {
      initialized.current = false;
      return;
    }

    if (!initialRect || !element || initialized.current) {
      return;
    }

    const rect = measure(element);
    const rectDelta = getRectDelta(rect, initialRect);

    // Only perform layout shift scroll compensation once
    initialized.current = true;

    if (rectDelta.x > 0 || rectDelta.y > 0) {
      const firstScrollableAncestor = getFirstScrollableAncestor(element);

      if (firstScrollableAncestor) {
        firstScrollableAncestor.scrollBy({
          top: rectDelta.y,
          left: rectDelta.x,
        });
      }
    }
  }, [disabled, initialRect, measure, element]);
}
