import {signal} from '@dnd-kit/state';
import type {UniqueIdentifier} from '@dnd-kit/types';
import {PubSub} from '@dnd-kit/utilities';

import {Draggable, Droppable} from '../nodes';

class Registry<T> {
  private map = signal<Map<UniqueIdentifier, T>>(new Map());
  private pubSub = new PubSub();

  public [Symbol.iterator]() {
    return this.map.peek().values();
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

    this.pubSub.notify({type: 'register', key, value});

    return () => this.unregister(key, value);
  };

  public unregister = (key: UniqueIdentifier, value: T) => {
    if (this.get(key) !== value) {
      return;
    }

    const updatedMap = new Map(this.map.peek());
    updatedMap.delete(key);

    this.map.value = updatedMap;

    this.pubSub.notify({type: 'unregister', key, value});
  };

  public subscribe = this.pubSub.subscribe;
}

export class DragDropRegistry<T extends Draggable, U extends Droppable> {
  public draggable: Registry<T> = new Registry();
  public droppable: Registry<U> = new Registry();

  public register(instance: T | U) {
    if (instance instanceof Draggable) {
      return this.draggable.register(instance.id, instance);
    }

    if (instance instanceof Droppable) {
      return this.droppable.register(instance.id, instance);
    }

    throw new Error('Invalid instance type');
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
