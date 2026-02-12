import {effect} from '@dnd-kit/state';
import type {CleanupFunction} from '@dnd-kit/state';
import {
  Sensor,
  configurator,
  ActivationController,
  type ActivationConstraints,
} from '@dnd-kit/abstract';
import type {Coordinates} from '@dnd-kit/geometry';
import {
  getDocument,
  getDocuments,
  getEventCoordinates,
  getFrameTransform,
  isElement,
  isHTMLElement,
  isInteractiveElement,
  isPointerEvent,
  isTextInput,
  Listeners,
  scheduler,
} from '@dnd-kit/dom/utilities';

import type {DragDropManager} from '../../manager/index.ts';
import type {Draggable} from '../../entities/index.ts';

import {PointerActivationConstraints} from './PointerActivationConstraints.ts';

type Maybe<T> = T | undefined;

export interface PointerSensorOptions {
  activationConstraints?:
    | ActivationConstraints<PointerEvent>
    | ((
        event: PointerEvent,
        source: Draggable
      ) => ActivationConstraints<PointerEvent> | undefined);
  activatorElements?:
    | Maybe<Element>[]
    | ((source: Draggable) => Maybe<Element>[]);
  preventActivation?: (event: PointerEvent, source: Draggable) => boolean;
}

const defaults = Object.freeze<PointerSensorOptions>({
  activationConstraints(event, source) {
    const {pointerType, target} = event;

    if (
      pointerType === 'mouse' &&
      isElement(target) &&
      (source.handle === target || source.handle?.contains(target))
    ) {
      return undefined;
    }

    if (pointerType === 'touch') {
      return [
        new PointerActivationConstraints.Delay({value: 250, tolerance: 5}),
      ];
    }

    if (isTextInput(target) && !event.defaultPrevented) {
      return [
        new PointerActivationConstraints.Delay({value: 200, tolerance: 0}),
      ];
    }

    return [
      new PointerActivationConstraints.Delay({value: 200, tolerance: 10}),
      new PointerActivationConstraints.Distance({value: 5}),
    ];
  },
  preventActivation(event, source) {
    const {target} = event;

    if (target === source.element) return false;
    if (target === source.handle) return false;
    if (!isElement(target)) return false;
    if (source.handle?.contains(target)) return false;

    return isInteractiveElement(target);
  },
});

type LatestState = {
  event: PointerEvent | undefined;
  coordinates: Coordinates | undefined;
};

/**
 * The PointerSensor class is an input sensor that handles Pointer events,
 * such as mouse, touch and pen interactions.
 */
export class PointerSensor extends Sensor<
  DragDropManager,
  PointerSensorOptions
> {
  #cleanup: Set<CleanupFunction> = new Set();

  protected listeners = new Listeners();

  protected initialCoordinates: Coordinates | undefined;

  protected controller: ActivationController<PointerEvent> | undefined;

  constructor(
    public manager: DragDropManager,
    public options?: PointerSensorOptions
  ) {
    super(manager);

    this.handleCancel = this.handleCancel.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  protected activationConstraints(
    event: PointerEvent,
    source: Draggable,
    options = this.options
  ) {
    const {activationConstraints = defaults.activationConstraints} =
      options ?? {};

    const constraints =
      typeof activationConstraints === 'function'
        ? activationConstraints(event, source)
        : activationConstraints;

    return constraints;
  }

  public bind(source: Draggable, options = this.options) {
    const unbind = effect(() => {
      const controller = new AbortController();
      const {signal} = controller;
      const listener: EventListener = (event: Event) => {
        if (isPointerEvent(event)) {
          this.handlePointerDown(event, source, options);
        }
      };
      let targets = [source.handle ?? source.element];

      if (options?.activatorElements) {
        if (Array.isArray(options.activatorElements)) {
          targets = options.activatorElements;
        } else {
          targets = options.activatorElements(source);
        }
      }

      for (const target of targets) {
        if (!target) continue;

        patchWindow(target.ownerDocument.defaultView);
        target.addEventListener('pointerdown', listener, {signal});
      }

      return () => controller.abort();
    });

    return unbind;
  }

  protected handlePointerDown(
    event: PointerEvent,
    source: Draggable,
    options: PointerSensorOptions | undefined
  ) {
    if (
      this.disabled ||
      !event.isPrimary ||
      event.button !== 0 ||
      !isElement(event.target) ||
      source.disabled ||
      isCapturedBySensor(event) ||
      !this.manager.dragOperation.status.idle
    ) {
      return;
    }

    const {preventActivation = defaults.preventActivation} = options ?? {};

    if (preventActivation?.(event, source)) {
      return;
    }

    const {target} = event;
    const isNativeDraggable =
      isHTMLElement(target) &&
      target.draggable &&
      target.getAttribute('draggable') === 'true';

    const offset = getFrameTransform(source.element);
    const {x, y} = getEventCoordinates(event);

    this.initialCoordinates = {
      x: x * offset.scaleX + offset.x,
      y: y * offset.scaleY + offset.y,
    };

    const constraints = this.activationConstraints(event, source, options);
    (event as any).sensor = this;

    const controller = new ActivationController<PointerEvent>(
      constraints,
      (event) => this.handleStart(source, event)
    );

    controller.signal.onabort = () => this.handleCancel(event);
    controller.onEvent(event);

    this.controller = controller;

    const documents = getDocuments();
    const unbindListeners = this.listeners.bind(documents, [
      {
        type: 'pointermove',
        listener: (event: PointerEvent) =>
          this.handlePointerMove(event, source),
      },
      {
        type: 'pointerup',
        listener: this.handlePointerUp,
        options: {
          capture: true,
        },
      },
      {                                                                     
        type: 'pointercancel',                 
        listener: this.handleCancel,                                        
      },   
      {
        // Cancel activation if there is a competing Drag and Drop interaction
        type: 'dragstart',
        listener: isNativeDraggable ? this.handleCancel : preventDefault,
        options: {
          capture: true,
        },
      },
    ]);

    const cleanup = () => {
      unbindListeners();
      this.initialCoordinates = undefined;
    };

    this.#cleanup.add(cleanup);
  }

  private latest: LatestState = {
    event: undefined,
    coordinates: undefined,
  };

  protected handleMove = () => {
    const {event, coordinates: to} = this.latest;

    if (!event || !to) {
      return;
    }

    this.manager.actions.move({event, to});
  };

  protected handlePointerMove(event: PointerEvent, source: Draggable) {
    if (this.controller?.activated === false) {
      this.controller?.onEvent(event);
      return;
    }

    if (this.manager.dragOperation.status.dragging) {
      const coordinates = getEventCoordinates(event);
      const offset = getFrameTransform(source.element);

      coordinates.x = coordinates.x * offset.scaleX + offset.x;
      coordinates.y = coordinates.y * offset.scaleY + offset.y;

      event.preventDefault();
      event.stopPropagation();

      this.latest.event = event;
      this.latest.coordinates = coordinates;

      scheduler.schedule(this.handleMove);
    }
  }

  private handlePointerUp(event: PointerEvent) {
    // End the drag and drop operation
    const {status} = this.manager.dragOperation;

    if (!status.idle) {
      // Prevent the default behaviour of the event
      event.preventDefault();
      event.stopPropagation();

      const canceled = !status.initialized;
      this.manager.actions.stop({event, canceled});
    }

    this.cleanup();
  }

  protected handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.handleCancel(event);
    }
  }

  protected handleStart(source: Draggable, event: PointerEvent) {
    const {manager, initialCoordinates} = this;

    if (!initialCoordinates || !manager.dragOperation.status.idle) {
      return;
    }

    if (event.defaultPrevented) {
      return;
    }

    const controller = manager.actions.start({
      coordinates: initialCoordinates,
      event,
      source,
    });

    if (controller.signal.aborted) return this.cleanup();

    event.preventDefault();

    const ownerDocument = getDocument(event.target);
    const pointerCaptureTarget = ownerDocument.body;

    pointerCaptureTarget.setPointerCapture(event.pointerId);

    const listenerTargets = isElement(event.target)
      ? [event.target, pointerCaptureTarget]
      : pointerCaptureTarget;

    const unbind = this.listeners.bind(listenerTargets, [
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
        type: 'contextmenu',
        listener: preventDefault,
      },
      {
        type: 'keydown',
        listener: this.handleKeyDown,
      },
    ]);

    this.#cleanup.add(unbind);
  }

  protected handleCancel(event: Event) {
    const {dragOperation} = this.manager;

    if (dragOperation.status.initialized) {
      this.manager.actions.stop({event, canceled: true});
    }

    this.cleanup();
  }

  protected cleanup() {
    this.latest = {
      event: undefined,
      coordinates: undefined,
    };
    this.#cleanup.forEach((cleanup) => cleanup());
    this.#cleanup.clear();
  }

  public destroy() {
    this.cleanup();
    this.listeners.clear();
  }

  static configure = configurator(PointerSensor);

  static defaults = defaults;
}

function isCapturedBySensor(event: Event) {
  return 'sensor' in event;
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
