import type {AnyFunction} from '@dnd-kit/types';

import type {DragDropManager} from './manager';
import type {DragOperation} from './dragOperation';
import type {Draggable, Droppable} from '../nodes';
import type {Collisions} from '../collision';

export type Events = Record<string, {} | undefined>;

class Monitor<T extends Events> {
  private registry = new Map<keyof T, Set<AnyFunction>>();

  public addEventListener<U extends keyof T>(
    name: U,
    handler: (event: T[U]) => void
  ) {
    const {registry} = this;
    const listeners = new Set(registry.get(name));

    listeners.add(handler);
    registry.set(name, listeners);

    return () => this.removeEventListener(name, handler);
  }

  public removeEventListener(name: keyof T, handler: AnyFunction) {
    const {registry} = this;
    const listeners = new Set(registry.get(name));

    listeners.delete(handler);
    registry.set(name, listeners);
  }

  public dispatch<U extends keyof T>(name: U, event?: T[U], ...args: any[]) {
    const {registry} = this;
    const listeners = registry.get(name);

    if (!listeners) {
      return;
    }

    for (const listener of listeners) {
      listener(event, ...args);
    }
  }
}

export type DragDropEvents<T extends Draggable, U extends Droppable> = {
  collision: {collisions: Collisions; preventDefault(): void};
  dragstart: {};
  dragmove: {};
  dragover: {operation: DragOperation<T, U>};
  dragend: {
    operation: DragOperation<T, U>;
    canceled: boolean;
    suspend(): {resume(): void; abort(): void};
  };
};

export class DragDropMonitor<
  T extends Draggable,
  U extends Droppable,
  V extends DragDropManager<T, U>,
> extends Monitor<DragDropEvents<T, U>> {
  constructor(private manager: V) {
    super();
  }

  public dispatch<Key extends keyof DragDropEvents<T, U>>(
    type: Key,
    event: DragDropEvents<T, U>[Key]
  ) {
    super.dispatch(type, event, this.manager);
  }
}
