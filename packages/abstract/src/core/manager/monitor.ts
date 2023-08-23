import type {Coordinates} from '@dnd-kit/geometry';

import type {Draggable, Droppable} from '../entities/index.js';
import type {Collisions} from '../collision/index.js';
import type {DragDropManager} from './manager.js';
import type {DragOperation} from './dragOperation.js';

export type Events = Record<string, (...args: any[]) => void>;

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
    event: {
      collisions: Collisions;
      defaultPrevented: boolean;
      preventDefault(): void;
    },
    manager: V
  ): void;
  beforedragstart(event: {operation: DragOperation<T, U>}, manager: V): void;
  dragstart(
    event: {
      operation: DragOperation<T, U>;
    },
    manager: V
  ): void;
  dragmove(
    event: {
      operation: DragOperation<T, U>;
      to?: Coordinates;
      by?: Coordinates;
      cancelable: boolean;
      defaultPrevented: boolean;
      preventDefault(): void;
    },
    manager: V
  ): void;
  dragover(event: {operation: DragOperation<T, U>}, manager: V): void;
  dragend(
    event: {
      operation: DragOperation<T, U>;
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
