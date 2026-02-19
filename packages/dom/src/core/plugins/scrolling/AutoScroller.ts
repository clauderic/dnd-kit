import {configurator, Plugin} from '@dnd-kit/abstract';
import {effect} from '@dnd-kit/state';
import type {CleanupFunction} from '@dnd-kit/state';
import type {Axis} from '@dnd-kit/geometry';

import type {DragDropManager} from '../../manager/index.ts';
import {Scroller} from './Scroller.ts';
import {scheduler} from '../../../utilities/scheduling/scheduler.ts';

export interface AutoScrollerOptions {
  /**
   * Base scroll speed multiplier. Higher values scroll faster.
   * @default 25
   */
  acceleration?: number;
  /**
   * Percentage of container dimensions that defines the scroll activation zone.
   * A single number applies to both axes. Use `{ x, y }` to set per-axis
   * thresholds. Set an axis to `0` to disable auto-scrolling on that axis.
   * @default { x: 0.2, y: 0.2 }
   */
  threshold?: number | Record<Axis, number>;
}

const AUTOSCROLL_INTERVAL = 10;

export class AutoScroller extends Plugin<DragDropManager, AutoScrollerOptions> {
  public destroy: CleanupFunction;

  constructor(manager: DragDropManager, options?: AutoScrollerOptions) {
    super(manager, options);

    const scroller = manager.registry.plugins.get(Scroller);

    if (!scroller) {
      throw new Error('AutoScroller plugin depends on Scroller plugin');
    }

    const scrollOptions = {
      acceleration: options?.acceleration,
      threshold:
        typeof options?.threshold === 'number'
          ? {x: options.threshold, y: options.threshold}
          : options?.threshold,
    };

    this.destroy = effect(() => {
      if (this.disabled) {
        return;
      }

      // We consume the position from the drag operation
      // so that this effect is run when the position changes
      const {position: _, status} = manager.dragOperation;

      if (status.dragging) {
        const canScroll = scroller.scroll(undefined, scrollOptions);

        if (canScroll) {
          scroller.autoScrolling = true;
          const interval = setInterval(
            () =>
              scheduler.schedule(() =>
                scroller.scroll(undefined, scrollOptions)
              ),
            AUTOSCROLL_INTERVAL
          );

          return () => {
            clearInterval(interval);
          };
        } else {
          scroller.autoScrolling = false;
        }
      }
    });
  }

  static configure = configurator(AutoScroller);
}
