import type {Coordinates} from '@dnd-kit/geometry';

import type {Draggable, Droppable} from '../entities/index.ts';
import type {Collisions} from '../collision/index.ts';
import type {DragDropManager} from './manager.ts';
import type {DragOperation} from './dragOperation.ts';

export type Events = Record<string, (...args: any[]) => void>;

export type Preventable<T> = T & {
  cancelable: boolean;
  defaultPrevented: boolean;
  preventDefault(): void;
};

class Monitor<T extends Events> {
  private registry = new Map<keyof T, Set<T[keyof T]>>();

  public addEventListener<U extends keyof T>(name: U, handler: T[U]) {
    const {registry} = this;
    const listeners = new Set(registry.get(name));

    listeners.add(handler);
    registry.set(name, listeners);

    return () => this.removeEventListener(name, handler);
  }

  public removeEventListener(name: keyof T, handler: T[keyof T]) {
    const {registry} = this;
    const listeners = new Set(registry.get(name));

    listeners.delete(handler);
    registry.set(name, listeners);
  }

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

export type DragDropEvents<
  T extends Draggable,
  U extends Droppable,
  V extends DragDropManager<T, U>,
> = {
  collision(
    event: Preventable<{
      collisions: Collisions;
    }>,
    manager: V
  ): void;
  beforedragstart(
    event: Preventable<{
      operation: DragOperation<T, U>;
      nativeEvent?: Event;
    }>,
    manager: V
  ): void;
  dragstart(
    event: {
      cancelable: false;
      operation: DragOperation<T, U>;
      nativeEvent?: Event;
    },
    manager: V
  ): void;
  dragmove(
    event: Preventable<{
      operation: DragOperation<T, U>;
      to?: Coordinates;
      by?: Coordinates;
      nativeEvent?: Event;
    }>,
    manager: V
  ): void;
  dragover(
    event: Preventable<{
      operation: DragOperation<T, U>;
    }>,
    manager: V
  ): void;
  dragend(
    event: {
      operation: DragOperation<T, U>;
      nativeEvent?: Event;
      canceled: boolean;
      suspend(): {resume(): void; abort(): void};
    },
    manager: V
  ): void;
};

export class DragDropMonitor<
  T extends Draggable,
  U extends Droppable,
  V extends DragDropManager<T, U>,
> extends Monitor<DragDropEvents<T, U, V>> {
  constructor(private manager: V) {
    super();
  }

  public dispatch<Key extends keyof DragDropEvents<T, U, V>>(
    type: Key,
    event: Parameters<DragDropEvents<T, U, V>[Key]>[0]
  ) {
    const args = [event, this.manager] as any;

    super.dispatch(type, ...args);
  }
}

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
