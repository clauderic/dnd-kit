import {Sensor} from '@dnd-kit/abstract';
import {effect} from '@dnd-kit/state';
import type {CleanupFunction} from '@dnd-kit/types';
import {Listeners, getOwnerDocument} from '@dnd-kit/dom-utilities';

import type {DragDropManager} from '../../manager';
import type {Draggable} from '../../nodes';
import {AutoScroller} from '../../plugins';
import {DOMRectangle} from '../../shapes';

export type KeyCode = KeyboardEvent['code'];

export type KeyboardCodes = {
  start: KeyCode[];
  cancel: KeyCode[];
  end: KeyCode[];
};

export interface KeyboardSensorOptions {
  keyboardCodes?: KeyboardCodes;
}

const DEFAULT_KEYBOARD_CODES: KeyboardCodes = {
  start: ['Space', 'Enter'],
  cancel: ['Escape'],
  end: ['Space', 'Enter'],
};

const DEFAULT_OFFSET = 10;

/**
 * The KeyboardSensor class is an input sensor that handles Keyboard events.
 */
export class KeyboardSensor extends Sensor<
  DragDropManager,
  KeyboardSensorOptions
> {
  constructor(protected manager: DragDropManager) {
    super(manager);
  }

  private listeners = new Listeners();

  private cleanup: CleanupFunction | undefined;

  public bind(source: Draggable, options: KeyboardSensorOptions) {
    const unbind = effect(() => {
      const target = source.activator ?? source.element;
      const listener: EventListener = (event: Event) => {
        if (event instanceof KeyboardEvent) {
          this.handleKeyDown(event, source, options);
        }
      };

      if (target) {
        target.addEventListener('keydown', listener);

        return () => {
          target.removeEventListener('keydown', listener);
        };
      }
    });

    return unbind;
  }

  private handleKeyDown = (
    event: KeyboardEvent,
    source: Draggable,
    options: KeyboardSensorOptions
  ) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (source.disabled === true || !source.element) {
      return;
    }

    const {keyboardCodes = DEFAULT_KEYBOARD_CODES} = options;

    if (!keyboardCodes.start.includes(event.code)) {
      return;
    }

    if (this.manager.dragOperation.status !== 'idle') {
      return;
    }

    const {center} = new DOMRectangle(source.element);

    const cleanupSideEffects = this.sideEffects();

    this.manager.actions.setDragSource(source.id);
    this.manager.actions.start({
      x: center.x,
      y: center.y,
    });

    event.preventDefault();
    event.stopImmediatePropagation();

    const ownerDocument = getOwnerDocument(source.element);
    const onKeyUp = (event: KeyboardEvent) => {
      if (keyboardCodes.end.includes(event.code)) {
        event.preventDefault();

        this.manager.actions.stop();
        this.cleanup?.();
        cleanupSideEffects();

        setTimeout(() => {
          const draggable = this.manager.registry.draggable.get(source.id);

          if (draggable?.element instanceof HTMLElement) {
            draggable.element.focus();
          }
        }, 50);
        return;
      }

      const {shape} = this.manager.dragOperation;

      if (!shape) {
        return;
      }

      const {center} = shape;
      const factor = event.shiftKey ? 5 : 1;
      const offset = {
        x: 0,
        y: 0,
      };

      switch (event.code) {
        case 'ArrowUp': {
          offset.y = -DEFAULT_OFFSET * factor;
          break;
        }
        case 'ArrowDown': {
          offset.y = DEFAULT_OFFSET * factor;
          break;
        }
        case 'ArrowLeft': {
          offset.x = -DEFAULT_OFFSET * factor;
          break;
        }
        case 'ArrowRight': {
          offset.x = DEFAULT_OFFSET * factor;
          break;
        }
      }

      if (offset.x || offset.y) {
        event.preventDefault();

        if (!this.manager.scroller.scrollBy(offset.x, offset.y)) {
          this.manager.actions.move({
            x: center.x + offset.x,
            y: center.y + offset.y,
          });
        }
      }
    };

    this.cleanup = this.listeners.bind(ownerDocument, [
      {type: 'keydown', listener: onKeyUp},
    ]);
  };

  private sideEffects(): CleanupFunction {
    const effectCleanupFns: CleanupFunction[] = [];

    const autoScroller = this.manager.plugins.get(AutoScroller);

    if (autoScroller?.disabled === false) {
      autoScroller.disable();

      effectCleanupFns.push(() => {
        autoScroller.enable();
      });
    }

    return () => effectCleanupFns.forEach((cleanup) => cleanup());
  }

  public destroy() {
    // Remove all event listeners
    this.listeners.clear();
  }
}
