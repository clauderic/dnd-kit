import {effect} from '@dnd-kit/state';
import type {CleanupFunction} from '@dnd-kit/state';
import {Sensor, configurator} from '@dnd-kit/abstract';
import {
  exceedsDistance,
  type Distance,
  type Coordinates,
} from '@dnd-kit/geometry';
import {getDocument, Listeners} from '@dnd-kit/dom/utilities';

import type {DragDropManager} from '../../manager/index.js';
import type {Draggable} from '../../nodes/index.js';

export interface DelayConstraint {
  value: number;
  tolerance: Distance;
}

export interface DistanceConstraint {
  value: Distance;
  tolerance?: Distance;
}

export interface ActivationConstraints {
  distance?: DistanceConstraint;
  delay?: DelayConstraint;
}

export interface PointerSensorOptions {
  activationConstraints?:
    | ActivationConstraints
    | ((
        event: PointerEvent,
        source: Draggable
      ) => ActivationConstraints | undefined);
}

/**
 * The PointerSensor class is an input sensor that handles Pointer events,
 * such as mouse, touch and pen interactions.
 */
export class PointerSensor extends Sensor<
  DragDropManager,
  PointerSensorOptions
> {
  protected listeners = new Listeners();

  protected cleanup: CleanupFunction | undefined;

  protected initialCoordinates: Coordinates | undefined;

  #clearTimeout: CleanupFunction | undefined;

  #document: Document | undefined;

  constructor(
    protected manager: DragDropManager,
    public options?: PointerSensorOptions
  ) {
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

  public bind(source: Draggable, options = this.options) {
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

  protected handlePointerDown(
    event: PointerEvent,
    source: Draggable,
    options: PointerSensorOptions = {}
  ) {
    if (this.disabled) {
      return;
    }

    if (
      !event.isPrimary ||
      event.button !== 0 ||
      !(event.target instanceof Element)
    ) {
      return;
    }

    if (source.disabled) {
      return;
    }

    this.initialCoordinates = {
      x: event.clientX,
      y: event.clientY,
    };

    const {activationConstraints} = options;
    const constraints =
      typeof activationConstraints === 'function'
        ? activationConstraints(event, source)
        : activationConstraints;

    if (!constraints?.delay && !constraints?.distance) {
      this.handleStart(source, event);
      event.stopImmediatePropagation();
    } else {
      const {delay} = constraints;

      if (delay) {
        const timeout = setTimeout(
          () => this.handleStart(source, event),
          delay.value
        );

        this.#clearTimeout = () => {
          clearTimeout(timeout);
          this.#clearTimeout = undefined;
        };
      }
    }

    const ownerDocument = getDocument(event.target);

    this.#document = ownerDocument;

    const unbindListeners = this.listeners.bind(ownerDocument, [
      {
        type: 'pointermove',
        listener: (event: PointerEvent) =>
          this.handlePointerMove(event, source, options),
      },
      {
        type: 'pointerup',
        listener: this.handlePointerUp.bind(this),
      },
      {
        // Prevent scrolling on touch devices
        type: 'touchmove',
        listener: preventDefault,
        options: {
          passive: false,
        },
      },
      {
        // Cancel activation if there is a competing Drag and Drop interaction
        type: 'dragstart',
        listener: this.handleCancel.bind(this),
      },
      {
        type: 'keydown',
        listener: this.handleKeyDown.bind(this),
      },
    ]);

    this.cleanup = () => {
      unbindListeners();

      this.#clearTimeout?.();
      this.initialCoordinates = undefined;
    };
  }

  protected sideEffects() {
    this.#document?.getSelection()?.removeAllRanges();
  }

  protected handlePointerMove(
    event: PointerEvent,
    source: Draggable,
    options: PointerSensorOptions
  ) {
    const coordinates = {
      x: event.clientX,
      y: event.clientY,
    };

    if (this.manager.dragOperation.status.dragging) {
      event.preventDefault();
      event.stopPropagation();

      this.manager.actions.move({to: coordinates});
      return;
    }

    if (!this.initialCoordinates) {
      return;
    }

    const delta = {
      x: coordinates.x - this.initialCoordinates.x,
      y: coordinates.y - this.initialCoordinates.y,
    };
    const {activationConstraints} = options;
    const constraints =
      typeof activationConstraints === 'function'
        ? activationConstraints(event, source)
        : activationConstraints;
    const {distance, delay} = constraints ?? {};

    if (distance) {
      if (
        distance.tolerance != null &&
        exceedsDistance(delta, distance.tolerance)
      ) {
        return this.handleCancel();
      }
      if (exceedsDistance(delta, distance.value)) {
        return this.handleStart(source, event);
      }
    }

    if (delay) {
      if (exceedsDistance(delta, delay.tolerance)) {
        return this.handleCancel();
      }
    }
  }

  private handlePointerUp(event: PointerEvent) {
    // Prevent the default behaviour of the event
    event.preventDefault();
    event.stopPropagation();

    // End the drag and drop operation
    const {status} = this.manager.dragOperation;

    if (!status.idle) {
      const canceled = !status.initialized;
      this.manager.actions.stop({canceled});
    }

    // Remove the pointer move and up event listeners
    this.cleanup?.();
  }

  protected handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.handleCancel();
    }
  }

  protected handleStart(source: Draggable, event: PointerEvent) {
    this.#clearTimeout?.();

    if (
      !this.initialCoordinates ||
      this.manager.dragOperation.status.initialized
    ) {
      return;
    }

    this.manager.actions.setDragSource(source.id);
    this.manager.actions.start({coordinates: this.initialCoordinates, event});

    this.sideEffects();
  }

  protected handleCancel() {
    const {dragOperation} = this.manager;

    if (dragOperation.status.initialized) {
      this.manager.actions.stop({canceled: true});
    }

    // Remove the pointer move and up event listeners
    this.cleanup?.();
  }

  public destroy() {
    // Remove all event listeners
    this.listeners.clear();
  }

  static configure = configurator(PointerSensor);
}

function preventDefault(event: Event) {
  event.preventDefault();
}
