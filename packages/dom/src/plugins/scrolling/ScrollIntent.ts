import {batch, effect, proxy} from '@dnd-kit/state';
import {Axes} from '@dnd-kit/geometry';
import type {Coordinates} from '@dnd-kit/geometry';
import {ScrollDirection} from '@dnd-kit/dom-utilities';

import type {DragDropManager} from '../../manager';

import {ScrollLock} from './ScrollLock';

const DIRECTIONS = [ScrollDirection.Forward, ScrollDirection.Reverse];

class ScrollIntent {
  public x = new ScrollLock();
  public y = new ScrollLock();
}

export function ScrollIntentTracker(manager: DragDropManager) {
  const scrollIntent = proxy<ScrollIntent | null>(null);
  let previousDelta: Coordinates | null = null;

  effect(() => {
    const {position} = manager.dragOperation;

    if (!position) {
      previousDelta = null;
      scrollIntent.value = null;
      return;
    }

    const {delta} = position;

    if (previousDelta) {
      const directions = {
        x: getDirection(delta.x, previousDelta.x),
        y: getDirection(delta.y, previousDelta.y),
      };

      const intent = scrollIntent.peek() ?? new ScrollIntent();

      batch(() => {
        for (const axis of Axes) {
          for (const direction of DIRECTIONS) {
            if (directions[axis] === direction) {
              intent[axis].unlock(direction);
            }
          }
        }

        scrollIntent.value = intent;
      });
    }

    previousDelta = delta;
  });

  return scrollIntent;
}

function getDirection(a: number, b: number): ScrollDirection {
  return Math.sign(a - b);
}
