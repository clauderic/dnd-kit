import type {AnyFunction} from '@dnd-kit/types';

import type {DragDropManager} from './manager';
import type {DragOperation} from './dragOperation';
import type {Draggable, Droppable} from '../nodes';
import type {Collisions} from '../collision';

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

  protected __dispatch<U extends keyof T>(name: U, ...args: Parameters<T[U]>) {
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

type DragDropEvent<
  T extends Draggable,
  U extends Droppable,
  V extends DragDropManager<T, U>,
> = (event: Record<string, any>, manager: V) => void;

export type DragDropEvents<
  T extends Draggable,
  U extends Droppable,
  V extends DragDropManager<T, U>,
> = {
  collision(
    event: {collisions: Collisions; preventDefault(): void},
    manager: V
  ): void;
  dragstart(event: {}, manager: V): void;
  dragmove(event: {}, manager: V): void;
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

    super.__dispatch(
      type,
      ...(args as Parameters<DragDropEvents<T, U, V>[Key]>)
    );
  }
}
