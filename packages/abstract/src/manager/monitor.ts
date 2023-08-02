import type {AnyFunction} from '@dnd-kit/types';

import type {DragDropManager} from './manager';
import type {DragOperation} from './dragOperation';

export type Events = Record<string, {} | undefined>;

class Monitor<T extends Events> {
  private registry = new Map<keyof T, Set<AnyFunction>>();

  public addEventListener(name: keyof T, handler: AnyFunction) {
    const {registry} = this;
    const listeners = new Set(registry.get(name));

    listeners.add(handler);
    registry.set(name, listeners);
  }

  public removeEventListener(name: keyof T, handler: AnyFunction) {
    const {registry} = this;
    const listeners = new Set(registry.get(name));

    listeners.delete(handler);
    registry.set(name, listeners);
  }

  public dispatch<U extends keyof T>(name: U, event?: T[U]) {
    const {registry} = this;
    const listeners = registry.get(name);

    if (!listeners) {
      return;
    }

    for (const listener of listeners) {
      listener(event);
    }
  }
}

export type DragDropEvents = {
  dragstart: {};
  dragmove: {};
  dragover: {operation: DragOperation};
  dragend: {operation: DragOperation; canceled: boolean};
};

export class DragDropMonitor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> extends Monitor<DragDropEvents> {
  constructor(private manager: T) {
    super();
  }

  public dispatch<T extends keyof DragDropEvents>(
    type: T,
    event: DragDropEvents[T]
  ) {
    super.dispatch(type, event);
  }
}
