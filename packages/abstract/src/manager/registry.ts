import type {UniqueIdentifier} from '@dnd-kit/types';
import {proxy} from '@dnd-kit/state';

import {Draggable, Droppable} from '../nodes';

class Registry<T> {
  private map = proxy<Map<UniqueIdentifier, T>>(new Map());

  public [Symbol.iterator]() {
    return this.map.value.values();
  }

  public get(identifier: UniqueIdentifier): T | undefined {
    return this.map.value.get(identifier);
  }

  public pick(...identifiers: UniqueIdentifier[]): T[] | undefined {
    const map = this.map.value;

    return identifiers.map((identifier) => {
      const entry = map.get(identifier);

      if (!entry) {
        throw new Error(
          `No registered entry found for identifier: ${identifier}`
        );
      }

      return entry;
    });
  }

  public register = (key: UniqueIdentifier, value: T) => {
    const updatedMap = new Map(this.map.peek());
    updatedMap.set(key, value);

    this.map.value = updatedMap;

    return () => this.unregister(key, value);
  };

  public unregister = (key: UniqueIdentifier, value: T) => {
    if (this.get(key) !== value) {
      return;
    }

    const updatedMap = new Map(this.map.peek());
    updatedMap.delete(key);

    this.map.value = updatedMap;
  };
}

export class DragDropRegistry<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable
> {
  public draggable: Registry<T> = new Registry();
  public droppable: Registry<U> = new Registry();

  public register(instance: T | U) {
    if (instance instanceof Draggable) {
      return this.draggable.register(instance.id, instance);
    }

    if (instance instanceof Droppable) {
      return this.droppable.register(instance.id, instance);
    }
  }

  public unregister(instance: T | U) {
    if (instance instanceof Draggable) {
      this.draggable.unregister(instance.id, instance);
    }

    if (instance instanceof Droppable) {
      this.droppable.unregister(instance.id, instance);
    }
  }
}
