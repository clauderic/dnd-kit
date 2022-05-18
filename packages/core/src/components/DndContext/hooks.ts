import {useMemo, useRef} from 'react';
import {useIsomorphicLayoutEffect} from '@dnd-kit/utilities';
import type {DeepRequired} from '@dnd-kit/utilities';

import {getRectDelta} from '../../utilities/rect';
import {getFirstScrollableAncestor} from '../../utilities/scroll';
import type {ClientRect} from '../../types';
import {defaultMeasuringConfiguration} from './defaults';
import type {MeasuringFunction, MeasuringConfiguration} from './types';
import type {DraggableNode} from '../../store';

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
  activeNode: DraggableNode | null | undefined;
  config: boolean | {x: boolean; y: boolean} | undefined;
  initialRect: ClientRect | null;
  measure: MeasuringFunction;
}

export function useLayoutShiftScrollCompensation({
  activeNode,
  measure,
  initialRect,
  config = true,
}: Options) {
  const initialized = useRef(false);
  const {x, y} = typeof config === 'boolean' ? {x: config, y: config} : config;

  useIsomorphicLayoutEffect(() => {
    const disabled = !x && !y;

    if (disabled || !activeNode) {
      initialized.current = false;
      return;
    }

    if (initialized.current || !initialRect) {
      // Return early if layout shift scroll compensation was already attempted
      // or if there is no initialRect to compare to.
      return;
    }

    // Get the most up to date node ref for the active draggable
    const node = activeNode?.node.current;

    if (!node || node.isConnected === false) {
      // Return early if there is no attached node ref or if the node is
      // disconnected from the document.
      return;
    }

    const rect = measure(node);
    const rectDelta = getRectDelta(rect, initialRect);

    if (!x) {
      rectDelta.x = 0;
    }

    if (!y) {
      rectDelta.y = 0;
    }

    // Only perform layout shift scroll compensation once
    initialized.current = true;

    if (Math.abs(rectDelta.x) > 0 || Math.abs(rectDelta.y) > 0) {
      const firstScrollableAncestor = getFirstScrollableAncestor(node);

      if (firstScrollableAncestor) {
        firstScrollableAncestor.scrollBy({
          top: rectDelta.y,
          left: rectDelta.x,
        });
      }
    }
  }, [activeNode, x, y, initialRect, measure]);
}
