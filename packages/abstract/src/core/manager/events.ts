import type {Coordinates} from '@dnd-kit/geometry';

import type {Draggable, Droppable} from '../entities/index.ts';
import type {Collisions} from '../collision/index.ts';
import type {DragDropManager} from './manager.ts';
import type {DragOperationSnapshot} from './operation.ts';

/** Base type for event handler functions */
export type Events = Record<string, (...args: any[]) => void>;

/**
 * Extends an event type with preventable functionality.
 *
 * @template T - The base event type
 */
export type Preventable<T> = T & {
  /** Whether the event can be canceled */
  cancelable: boolean;
  /** Whether the default action was prevented */
  defaultPrevented: boolean;
  /** Prevents the default action of the event */
  preventDefault(): void;
};

/**
 * Base class for event monitoring and dispatching.
 *
 * @template T - The type of events to monitor
 */
class Monitor<T extends Events> {
  private registry = new Map<keyof T, Set<T[keyof T]>>();

  /**
   * Adds an event listener for the specified event type.
   *
   * @param name - The name of the event to listen for
   * @param handler - The function to call when the event occurs
   * @returns A function to remove the event listener
   */
  public addEventListener<U extends keyof T>(name: U, handler: T[U]) {
    const {registry} = this;
    const listeners = new Set(registry.get(name));

    listeners.add(handler);
    registry.set(name, listeners);

    return () => this.removeEventListener(name, handler);
  }

  /**
   * Removes an event listener for the specified event type.
   *
   * @param name - The name of the event
   * @param handler - The function to remove
   */
  public removeEventListener(name: keyof T, handler: T[keyof T]) {
    const {registry} = this;
    const listeners = new Set(registry.get(name));

    listeners.delete(handler);
    registry.set(name, listeners);
  }

  /**
   * Dispatches an event to all registered listeners.
   *
   * @param name - The name of the event to dispatch
   * @param args - Arguments to pass to the event handlers
   */
  protected dispatch<U extends keyof T>(name: U, ...args: any[]) {
    const {registry} = this;
    const listeners = registry.get(name);

    if (!listeners) {
      return;
    }

    for (const listener of listeners) {
      listener(...args);
    }
  }
}

/**
 * Type definition for drag and drop events.
 *
 * @template T - The type of draggable entities
 * @template U - The type of droppable entities
 * @template V - The type of drag and drop manager
 */
export type DragDropEvents<
  T extends Draggable,
  U extends Droppable,
  V extends DragDropManager<T, U>,
> = {
  /** Event fired when collisions are detected */
  collision(
    event: Preventable<{
      collisions: Collisions;
    }>,
    manager: V
  ): void;
  /** Event fired before a drag operation starts */
  beforedragstart(
    event: Preventable<{
      operation: DragOperationSnapshot<T, U>;
      nativeEvent?: Event;
    }>,
    manager: V
  ): void;
  /** Event fired when a drag operation starts */
  dragstart(
    event: {
      cancelable: false;
      operation: DragOperationSnapshot<T, U>;
      nativeEvent?: Event;
    },
    manager: V
  ): void;
  /** Event fired when a drag operation moves */
  dragmove(
    event: Preventable<{
      operation: DragOperationSnapshot<T, U>;
      to?: Coordinates;
      by?: Coordinates;
      nativeEvent?: Event;
    }>,
    manager: V
  ): void;
  /** Event fired when a drag operation hovers over a droppable */
  dragover(
    event: Preventable<{
      operation: DragOperationSnapshot<T, U>;
    }>,
    manager: V
  ): void;
  /** Event fired when a drag operation ends */
  dragend(
    event: {
      operation: DragOperationSnapshot<T, U>;
      nativeEvent?: Event;
      canceled: boolean;
      suspend(): {resume(): void; abort(): void};
    },
    manager: V
  ): void;
};

export type CollisionEvent<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
  V extends DragDropManager<T, U> = DragDropManager<T, U>,
> = Parameters<DragDropEvents<T, U, V>['collision']>[0];

export type BeforeDragStartEvent<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
  V extends DragDropManager<T, U> = DragDropManager<T, U>,
> = Parameters<DragDropEvents<T, U, V>['beforedragstart']>[0];

export type DragStartEvent<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
  V extends DragDropManager<T, U> = DragDropManager<T, U>,
> = Parameters<DragDropEvents<T, U, V>['dragstart']>[0];

export type DragMoveEvent<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
  V extends DragDropManager<T, U> = DragDropManager<T, U>,
> = Parameters<DragDropEvents<T, U, V>['dragmove']>[0];

export type DragOverEvent<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
  V extends DragDropManager<T, U> = DragDropManager<T, U>,
> = Parameters<DragDropEvents<T, U, V>['dragover']>[0];

export type DragEndEvent<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
  V extends DragDropManager<T, U> = DragDropManager<T, U>,
> = Parameters<DragDropEvents<T, U, V>['dragend']>[0];

/**
 * Monitors and dispatches drag and drop events.
 *
 * @template T - The type of draggable entities
 * @template U - The type of droppable entities
 * @template V - The type of drag and drop manager
 */
export class DragDropMonitor<
  T extends Draggable,
  U extends Droppable,
  V extends DragDropManager<T, U>,
> extends Monitor<DragDropEvents<T, U, V>> {
  /**
   * Creates a new drag and drop monitor.
   *
   * @param manager - The drag and drop manager to monitor
   */
  constructor(private manager: V) {
    super();
  }

  /**
   * Dispatches a drag and drop event.
   *
   * @param type - The type of event to dispatch
   * @param event - The event data to dispatch
   */
  public dispatch<Key extends keyof DragDropEvents<T, U, V>>(
    type: Key,
    event: Parameters<DragDropEvents<T, U, V>[Key]>[0]
  ) {
    const args = [event, this.manager] as any;

    super.dispatch(type, ...args);
  }
}

/**
 * Creates a preventable event object.
 *
 * @param event - The base event object
 * @param cancelable - Whether the event can be canceled
 * @returns A preventable event object
 */
export function defaultPreventable<T>(
  event: T,
  cancelable = true
): Preventable<T> {
  let defaultPrevented = false;

  return {
    ...event,
    cancelable,
    get defaultPrevented() {
      return defaultPrevented;
    },
    preventDefault() {
      if (!cancelable) {
        return;
      }

      defaultPrevented = true;
    },
  };
}
