import {effect} from '@dnd-kit/state';
import {Sensor} from '@dnd-kit/abstract';
import type {CleanupFunction} from '@dnd-kit/types';
import {getOwnerDocument, Listeners} from '@dnd-kit/dom-utilities';

import type {DragDropManager} from '../../manager';
import type {Draggable} from '../../nodes';

interface ActivationConstraint {}

export interface PointerSensorOptions {
  activationConstraints?: ActivationConstraint[];
}

/**
 * The PointerSensor class is an input sensor that handles Pointer events,
 * such as mouse, touch and pen interactions.
 */
export class PointerSensor extends Sensor<
  DragDropManager,
  PointerSensorOptions
> {
  private listeners = new Listeners();

  private cleanup: CleanupFunction | undefined;

  constructor(protected manager: DragDropManager) {
    super(manager);

    // Adding a non-capture and non-passive `touchmove` listener in order
    // to force `event.preventDefault()` calls to work in dynamically added
    // touchmove event handlers. This is required for iOS Safari.
    this.listeners.bind(window, {
      type: 'touchmove',
      listener() {},
      options: {
        capture: false,
        passive: false,
      },
    });
  }

  public bind(source: Draggable, options?: PointerSensorOptions) {
    const unbind = effect(() => {
      const target = source.activator ?? source.element;
      const listener: EventListener = (event: Event) => {
        if (event instanceof PointerEvent) {
          this.handlePointerDown(event, source, options);
        }
      };

      if (target) {
        target.addEventListener('pointerdown', listener);

        return () => {
          target.removeEventListener('pointerdown', listener);
        };
      }
    });

    return unbind;
  }

  private handlePointerDown = (
    event: PointerEvent,
    source: Draggable,
    options?: PointerSensorOptions
  ) => {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    if (!(event.target instanceof Element)) {
      return;
    }

    if (source.disabled === true) {
      return;
    }

    this.manager.actions.setDragSource(source.id);

    event.stopImmediatePropagation();

    const ownerDocument = getOwnerDocument(event.target);

    this.cleanup = this.listeners.bind(ownerDocument, [
      {
        type: 'pointermove',
        listener: this.handlePointerMove,
      },
      {
        type: 'pointerup',
        listener: this.handlePointerUp,
      },
      {
        // Prevent scrolling on touch devices
        type: 'touchmove',
        listener: preventDefault,
      },
    ]);
  };

  private handlePointerMove = (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (this.manager.dragOperation.status === 'idle') {
      this.manager.actions.start({
        x: event.clientX,
        y: event.clientY,
      });
      return;
    }

    this.manager.actions.move({
      x: event.clientX,
      y: event.clientY,
    });
  };

  private handlePointerUp = (event: PointerEvent) => {
    // Prevent the default behaviour of the event
    event.preventDefault();
    event.stopPropagation();

    // End the drag and drop operation
    this.manager.actions.stop();

    // Remove the pointer move and up event listeners
    this.cleanup?.();
  };

  public destroy() {
    // Remove all event listeners
    this.listeners.clear();
  }
}

function preventDefault(event: Event) {
  event.preventDefault();
}
