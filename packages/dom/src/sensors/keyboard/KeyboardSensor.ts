import {Sensor} from '@dnd-kit/abstract';
import {effect} from '@dnd-kit/state';
import type {CleanupFunction} from '@dnd-kit/types';
import {Listeners, getOwnerDocument} from '@dnd-kit/dom-utilities';

import type {DragDropManager} from '../../manager';
import type {Draggable} from '../../nodes';
import {AutoScroller, Scroller} from '../../plugins';
import {DOMRectangle} from '../../shapes';
import {Coordinates} from '@dnd-kit/geometry';

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
    public options?: KeyboardSensorOptions
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
      event,
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

      if (isKeycode(event, keyboardCodes.up)) {
        this.handleMove('up', event);
      } else if (isKeycode(event, keyboardCodes.down)) {
        this.handleMove('down', event);
      }

      if (isKeycode(event, keyboardCodes.left)) {
        this.handleMove('left', event);
      } else if (isKeycode(event, keyboardCodes.right)) {
        this.handleMove('right', event);
      }
    };

    this.cleanup = this.listeners.bind(ownerDocument, [
      {type: 'keydown', listener: onKeyDown, options: {capture: true}},
    ]);
  };

  protected handleMove(
    direction: 'up' | 'down' | 'left' | 'right',
    event: KeyboardEvent
  ) {
    const {shape} = this.manager.dragOperation;
    const factor = event.shiftKey ? 5 : 1;
    let offset = {
      x: 0,
      y: 0,
    };

    if (!shape) {
      return;
    }

    switch (direction) {
      case 'up':
        offset = {x: 0, y: -DEFAULT_OFFSET * factor};
        break;
      case 'down':
        offset = {x: 0, y: DEFAULT_OFFSET * factor};
        break;
      case 'left':
        offset = {x: -DEFAULT_OFFSET * factor, y: 0};
        break;
      case 'right':
        offset = {x: DEFAULT_OFFSET * factor, y: 0};
        break;
    }

    if (offset?.x || offset?.y) {
      event.preventDefault();

      this.manager.actions.move({
        by: offset,
      });
    }
  }

  private sideEffects(): CleanupFunction {
    const effectCleanupFns: CleanupFunction[] = [];

    const autoScroller = this.manager.plugins.get(AutoScroller as any);

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
