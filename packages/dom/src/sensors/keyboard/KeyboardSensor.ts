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
          this.handleKeyUp(event, source, options);
        }
      };

      if (target) {
        target.addEventListener('keyup', listener);

        return () => {
          target.removeEventListener('keyup', listener);
        };
      }
    });

    return unbind;
  }

  private handleKeyUp = (
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

    const {center} = new DOMRectangle(source.element);

    const autoScroller = this.manager.plugins.get(AutoScroller);

    if (autoScroller) {
      autoScroller.disable();
    }

    this.manager.actions.setDragSource(source.id);
    this.manager.actions.start({
      x: center.x,
      y: center.y,
    });

    event.stopImmediatePropagation();

    const ownerDocument = getOwnerDocument(source.element);
    const onKeyUp = (event: KeyboardEvent) => {
      if (keyboardCodes.end.includes(event.code)) {
        event.preventDefault();

        this.manager.actions.stop();
        this.cleanup?.();

        setTimeout(() => {
          const draggable = this.manager.registry.draggable.get(source.id);

          if (draggable?.element instanceof HTMLElement) {
            draggable.element.focus();
          }
        }, 50);
        return;
      }

      if (!source.element) {
        return;
      }

      const {center} = new DOMRectangle(source.element);

      switch (event.code) {
        case 'ArrowUp':
          event.preventDefault();
          this.manager.actions.move({
            x: center.x,
            y: center.y - DEFAULT_OFFSET,
          });
          return;
        case 'ArrowDown':
          event.preventDefault();
          this.manager.actions.move({
            x: center.x,
            y: center.y + DEFAULT_OFFSET,
          });
          return;
        case 'ArrowLeft':
          event.preventDefault();
          this.manager.actions.move({
            x: center.x - DEFAULT_OFFSET,
            y: center.y,
          });
          return;
        case 'ArrowRight':
          event.preventDefault();
          this.manager.actions.move({
            x: center.x + DEFAULT_OFFSET,
            y: center.y,
          });
          return;
      }
    };

    this.cleanup = this.listeners.bind(ownerDocument, [
      {type: 'keydown', listener: onKeyUp, options: {capture: true}},
    ]);
  };

  public destroy() {
    // Remove all event listeners
    this.listeners.clear();
  }
}
