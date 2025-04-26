import {Sensor} from '@dnd-kit/abstract';
import {batch, effect} from '@dnd-kit/state';
import type {CleanupFunction} from '@dnd-kit/state';
import {
  getDocument,
  getWindow,
  isElement,
  isKeyboardEvent,
  scrollIntoViewIfNeeded,
  Listeners,
  DOMRectangle,
} from '@dnd-kit/dom/utilities';

import type {DragDropManager} from '../../manager/index.ts';
import type {Draggable} from '../../entities/index.ts';
import {AutoScroller} from '../../plugins/index.ts';

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
  shouldActivate?(args: {
    event: KeyboardEvent;
    source: Draggable;
    manager: DragDropManager;
  }): boolean;
}

const DEFAULT_SHOULD_ACTIVATE = (args: {
  event: KeyboardEvent;
  source: Draggable;
  manager: DragDropManager;
}) => {
  const {event, source} = args;
  const target = source.handle ?? source.element;
  return event.target === target;
};

const DEFAULT_KEYBOARD_CODES: KeyboardCodes = {
  start: ['Space', 'Enter'],
  cancel: ['Escape'],
  end: ['Space', 'Enter', 'Tab'],
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
    public manager: DragDropManager,
    public options?: KeyboardSensorOptions
  ) {
    super(manager);
  }

  #cleanupFunctions: CleanupFunction[] = [];

  protected listeners = new Listeners();

  public bind(source: Draggable, options = this.options) {
    const unbind = effect(() => {
      const target = source.handle ?? source.element;
      const listener: EventListener = (event: Event) => {
        if (isKeyboardEvent(event)) {
          this.handleSourceKeyDown(event, source, options);
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

  protected handleSourceKeyDown = (
    event: KeyboardEvent,
    source: Draggable,
    options: KeyboardSensorOptions | undefined
  ) => {
    if (this.disabled || event.defaultPrevented) {
      return;
    }

    if (!isElement(event.target)) {
      return;
    }

    if (source.disabled) {
      return;
    }

    const {
      keyboardCodes = DEFAULT_KEYBOARD_CODES,
      shouldActivate = DEFAULT_SHOULD_ACTIVATE,
    } = options ?? {};

    if (!keyboardCodes.start.includes(event.code)) {
      return;
    }

    if (!this.manager.dragOperation.status.idle) {
      return;
    }

    if (shouldActivate({event, source, manager: this.manager})) {
      this.handleStart(event, source, options);
    }
  };

  protected handleStart(
    event: KeyboardEvent,
    source: Draggable,
    options: KeyboardSensorOptions | undefined
  ) {
    const {element} = source;

    if (!element) {
      throw new Error('Source draggable does not have an associated element');
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    scrollIntoViewIfNeeded(element);

    const {center} = new DOMRectangle(element);
    const controller = this.manager.actions.start({
      event,
      coordinates: {
        x: center.x,
        y: center.y,
      },
      source,
    });

    if (controller.signal.aborted) return this.cleanup();

    this.sideEffects();

    const sourceDocument = getDocument(element);
    const sourceWindow = getWindow(sourceDocument);

    const listeners = [
      this.listeners.bind(sourceDocument, [
        {
          type: 'keydown',
          listener: (event: KeyboardEvent) =>
            this.handleKeyDown(event, source, options),
          options: {capture: true},
        },
      ]),
      this.listeners.bind(sourceWindow, [
        {type: 'resize', listener: () => this.handleEnd(event, true)},
      ]),
    ];

    this.#cleanupFunctions.push(...listeners);
  }

  protected handleKeyDown(
    event: KeyboardEvent,
    _source: Draggable,
    options: KeyboardSensorOptions | undefined
  ) {
    const {keyboardCodes = DEFAULT_KEYBOARD_CODES} = options ?? {};

    if (isKeycode(event, [...keyboardCodes.end, ...keyboardCodes.cancel])) {
      event.preventDefault();
      const canceled = isKeycode(event, keyboardCodes.cancel);

      this.handleEnd(event, canceled);
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
  }

  protected handleEnd(event: Event, canceled: boolean) {
    this.manager.actions.stop({
      event,
      canceled,
    });

    this.cleanup();
  }

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
        event,
        by: offset,
      });
    }
  }

  private sideEffects() {
    const autoScroller = this.manager.registry.plugins.get(AutoScroller as any);

    if (autoScroller?.disabled === false) {
      autoScroller.disable();

      this.#cleanupFunctions.push(() => {
        autoScroller.enable();
      });
    }
  }

  protected cleanup() {
    this.#cleanupFunctions.forEach((cleanup) => cleanup());
    this.#cleanupFunctions = [];
  }

  public destroy() {
    this.cleanup();
    // Remove all event listeners
    this.listeners.clear();
  }
}

function isKeycode(event: KeyboardEvent, codes: KeyCode[]) {
  return codes.includes(event.code);
}
