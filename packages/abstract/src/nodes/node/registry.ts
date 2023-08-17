import {signal} from '@dnd-kit/state';

import type {Node} from './node';
import type {UniqueIdentifier} from './types';

export class NodeRegistry<T extends Node> {
  private map = signal<Map<UniqueIdentifier, T>>(new Map());

  public [Symbol.iterator]() {
    return this.map.peek().values();
  }

  public has(identifier: UniqueIdentifier): boolean {
    return this.map.value.has(identifier);
  }

  public get(identifier: UniqueIdentifier): T | undefined {
    return this.map.value.get(identifier);
  }

  public register = (key: UniqueIdentifier, value: T) => {
    const current = this.map.peek();

    if (current.get(key) === value) {
      return;
    }

    const updatedMap = new Map(current);
    updatedMap.set(key, value);

    this.map.value = updatedMap;

    return () => this.unregister(key, value);
  };

  public unregister = (key: UniqueIdentifier, value: T) => {
    const current = this.map.peek();

    if (current.get(key) !== value) {
      return;
    }

    const updatedMap = new Map(current);
    updatedMap.delete(key);

    this.map.value = updatedMap;
  };

  public destroy() {
    for (const entry of this) {
      entry.destroy();
    }

    this.map.value = new Map();
  }
}
