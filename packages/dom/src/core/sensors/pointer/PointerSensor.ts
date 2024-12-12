import {batch, effect} from '@dnd-kit/state';
import type {CleanupFunction} from '@dnd-kit/state';
import {Sensor, configurator} from '@dnd-kit/abstract';
import {
  exceedsDistance,
  type Distance,
  type Coordinates,
} from '@dnd-kit/geometry';
import {
  getDocument,
  isElement,
  isHTMLElement,
  isPointerEvent,
  Listeners,
  getFrameTransform,
} from '@dnd-kit/dom/utilities';

import type {DragDropManager} from '../../manager/index.ts';
import type {Draggable} from '../../entities/index.ts';

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

  protected cleanup: Set<CleanupFunction> = new Set();

  protected initialCoordinates: Coordinates | undefined;

  protected source: Draggable | undefined = undefined;

  #clearTimeout: CleanupFunction | undefined;

  constructor(
    public manager: DragDropManager,
    public options?: PointerSensorOptions
  ) {
    super(manager);

    this.handleCancel = this.handleCancel.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    effect(() => {
      const unbindGlobal = this.bindGlobal(options ?? {});

      return () => {
        unbindGlobal();
      };
    });
  }

  public bind(source: Draggable, options = this.options) {
    const unbind = effect(() => {
      const target = source.handle ?? source.element;
      const listener: EventListener = (event: Event) => {
        if (isPointerEvent(event)) {
          this.handlePointerDown(event, source, options);
        }
      };

      if (target) {
        patchWindow(target.ownerDocument.defaultView);

        target.addEventListener('pointerdown', listener);

        return () => {
          target.removeEventListener('pointerdown', listener);
        };
      }
    });

    return unbind;
  }

  protected bindGlobal(options: PointerSensorOptions) {
    const documents = new Set<Document>();

    for (const draggable of this.manager.registry.draggables.value) {
      if (draggable.element) {
        documents.add(getDocument(draggable.element));
      }
    }

    for (const droppable of this.manager.registry.droppables.value) {
      if (droppable.element) {
        documents.add(getDocument(droppable.element));
      }
    }

    const unbindFns = Array.from(documents).map((doc) =>
      this.listeners.bind(doc, [
        {
          type: 'pointermove',
          listener: (event: PointerEvent) =>
            this.handlePointerMove(event, doc, options),
        },
        {
          type: 'pointerup',
          listener: this.handlePointerUp,
          options: {
            capture: true,
          },
        },
        {
          // Cancel activation if there is a competing Drag and Drop interaction
          type: 'dragstart',
          listener: this.handleDragStart,
        },
      ])
    );

    return () => {
      unbindFns.forEach((unbind) => unbind());
    };
  }

  protected handlePointerDown(
    event: PointerEvent,
    source: Draggable,
    options: PointerSensorOptions = {}
  ) {
    if (
      this.disabled ||
      !event.isPrimary ||
      event.button !== 0 ||
      !isElement(event.target) ||
      source.disabled
    ) {
      return;
    }

    const offset = getFrameTransform(source.element);

    this.initialCoordinates = {
      x: event.clientX * offset.scaleX + offset.x,
      y: event.clientY * offset.scaleY + offset.y,
    };

    this.source = source;

    const {activationConstraints} = options;
    const constraints =
      typeof activationConstraints === 'function'
        ? activationConstraints(event, source)
        : activationConstraints;

    event.stopImmediatePropagation();

    if (!constraints?.delay && !constraints?.distance) {
      this.handleStart(source, event);
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

    const cleanup = () => {
      this.#clearTimeout?.();
      this.initialCoordinates = undefined;
      this.source = undefined;
    };

    this.cleanup.add(cleanup);
  }

  protected handlePointerMove(
    event: PointerEvent,
    doc: Document,
    options: PointerSensorOptions
  ) {
    if (!this.source) {
      return;
    }

    const ownerDocument =
      this.source.element && getDocument(this.source.element);

    // Event may have duplicated between documents if user is bubbling events
    if (doc !== ownerDocument) {
      return;
    }

    const coordinates = {
      x: event.clientX,
      y: event.clientY,
    };

    const offset = getFrameTransform(this.source.element);

    coordinates.x = coordinates.x * offset.scaleX + offset.x;
    coordinates.y = coordinates.y * offset.scaleY + offset.y;

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
        ? activationConstraints(event, this.source)
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
        return this.handleStart(this.source, event);
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
    this.cleanup.forEach((cleanup) => cleanup());
    this.cleanup.clear();
  }

  protected handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.handleCancel();
    }
  }

  protected handleStart(source: Draggable, event: PointerEvent) {
    const {manager, initialCoordinates} = this;

    this.#clearTimeout?.();

    if (!initialCoordinates || manager.dragOperation.status.initialized) {
      return;
    }

    if (event.defaultPrevented) {
      return;
    }

    event.preventDefault();

    batch(() => {
      manager.actions.setDragSource(source.id);
      manager.actions.start({coordinates: initialCoordinates, event});
    });

    const ownerDocument = getDocument(event.target);
    const unbind = this.listeners.bind(ownerDocument, [
      {
        // Prevent scrolling on touch devices
        type: 'touchmove',
        listener: preventDefault,
        options: {
          passive: false,
        },
      },
      {
        // Prevent click events
        type: 'click',
        listener: preventDefault,
      },
      {
        type: 'keydown',
        listener: this.handleKeyDown,
      },
    ]);

    ownerDocument.body.setPointerCapture(event.pointerId);

    this.cleanup.add(unbind);
  }

  protected handleDragStart(event: DragEvent) {
    const {target} = event;

    if (!isElement(target)) {
      return;
    }

    const isNativeDraggable =
      isHTMLElement(target) &&
      target.draggable &&
      target.getAttribute('draggable') === 'true';

    if (isNativeDraggable) {
      this.handleCancel();
    } else {
      preventDefault(event);
    }
  }

  protected handleCancel() {
    const {dragOperation} = this.manager;

    if (dragOperation.status.initialized) {
      this.manager.actions.stop({canceled: true});
    }

    // Remove the pointer move and up event listeners
    this.cleanup.forEach((cleanup) => cleanup());
    this.cleanup.clear();
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

function noop() {}

const windows = new WeakSet<Window>();

function patchWindow(window: Window | null) {
  if (!window || windows.has(window)) {
    return;
  }

  window.addEventListener('touchmove', noop, {
    capture: false,
    passive: false,
  });
  windows.add(window);
}
