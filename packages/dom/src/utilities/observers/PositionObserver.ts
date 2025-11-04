import {
  PositionObserver,
  type PositionObserverEntry,
  type PositionObserverCallback,
} from 'position-observer';

import {getDocument} from '../execution-context/getDocument.ts';

export type PositionChangeCallback = (entry: PositionObserverEntry) => void;

export type PositionObserverRoot = Document;

export class PositionObserverRegistry {
  #elements = new WeakMap<Element, (entry: PositionObserverEntry) => void>();

  #handlePositionChange: PositionObserverCallback = (entries) => {
    for (const entry of entries) {
      const callback = this.#elements.get(entry.target);

      if (callback) {
        callback(entry);
      }
    }
  };

  #observers = new Map<PositionObserverRoot, PositionObserver>();

  public observe(element: Element, callback: PositionChangeCallback) {
    const root = getDocument(element);
    let observer = this.#observers.get(root);

    if (!observer) {
      observer = new PositionObserver(this.#handlePositionChange, {
        root,
      });
      this.#observers.set(root, observer);
    }

    this.#elements.set(element, callback);
    observer.observe(element);

    return () => this.unobserve(element);
  }

  public unobserve(element: Element) {
    this.#elements.delete(element);

    const root = getDocument(element);
    const observer = this.#observers.get(root);

    observer?.unobserve(element);
  }

  public disconnect() {
    for (const observer of this.#observers.values()) {
      observer.disconnect();
    }

    this.#observers.clear();
    this.#elements = new WeakMap();
  }
}

let registry: PositionObserverRegistry | null = null;

export function observePosition(
  element: Element,
  callback: PositionChangeCallback
) {
  if (!registry) {
    registry = new PositionObserverRegistry();
  }

  return registry.observe(element, callback);
}
