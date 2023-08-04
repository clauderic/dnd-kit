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
  up: KeyCode[];
  down: KeyCode[];
  left: KeyCode[];
  right: KeyCode[];
};

export interface KeyboardSensorOptions {
  keyboardCodes?: KeyboardCodes;
}

const DEFAULT_KEYBOARD_CODES: KeyboardCodes = {
  start: ['Space', 'Enter'],
  cancel: ['Escape'],
  end: ['Space', 'Enter'],
  up: ['ArrowUp'],
  down: ['ArrowDown'],
  left: ['ArrowLeft'],
  right: ['ArrowRight'],
};

const DEFAULT_OFFSET = 10;

/**
 * The KeyboardSensor class is an input sensor that handles Keyboard events.
 */
export class KeyboardSensor extends Sensor<
  DragDropManager,
  KeyboardSensorOptions
> {
  constructor(
    protected manager: DragDropManager,
    protected options?: KeyboardSensorOptions
  ) {
    super(manager);
  }

  private listeners = new Listeners();

  private cleanup: CleanupFunction | undefined;

  public bind(source: Draggable, options = this.options) {
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
    options: KeyboardSensorOptions | undefined
  ) => {
    if (this.disabled) {
      return;
    }

    if (!(event.target instanceof Element)) {
      return;
    }

    if (source.disabled || !source.element) {
      return;
    }

    const {keyboardCodes = DEFAULT_KEYBOARD_CODES} = options ?? {};

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
      coordinates: {
        x: center.x,
        y: center.y,
      },
    });

    event.preventDefault();
    event.stopImmediatePropagation();

    const ownerDocument = getOwnerDocument(source.element);
    const onKeyDown = (event: KeyboardEvent) => {
      if (isKeycode(event, [...keyboardCodes.end, ...keyboardCodes.cancel])) {
        event.preventDefault();

        this.manager.actions.stop({
          canceled: isKeycode(event, keyboardCodes.cancel),
        });

        this.cleanup?.();
        cleanupSideEffects();
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

      if (isKeycode(event, keyboardCodes.up)) {
        offset.y = -DEFAULT_OFFSET * factor;
      } else if (isKeycode(event, keyboardCodes.down)) {
        offset.y = DEFAULT_OFFSET * factor;
      }

      if (isKeycode(event, keyboardCodes.left)) {
        offset.x = -DEFAULT_OFFSET * factor;
      } else if (isKeycode(event, keyboardCodes.right)) {
        offset.x = DEFAULT_OFFSET * factor;
      }

      if (offset.x || offset.y) {
        event.preventDefault();

        if (!this.manager.scroller.scrollBy(offset.x, offset.y)) {
          this.manager.actions.move({
            coordinates: {
              x: center.x + offset.x,
              y: center.y + offset.y,
            },
          });
        }
      }
    };

    this.cleanup = this.listeners.bind(ownerDocument, [
      {type: 'keydown', listener: onKeyDown, options: {capture: true}},
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

function isKeycode(event: KeyboardEvent, codes: KeyCode[]) {
  return codes.includes(event.code);
}
