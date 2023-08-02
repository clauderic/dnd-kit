import {signal, type Signal} from '@preact/signals-core';

import {computed} from './computed';

export function reactive(target: Object, propertyKey: string) {
  const store = new WeakMap<any, Signal<any>>();

  Object.defineProperty(target, propertyKey, {
    get() {
      if (!store.get(this)) {
        store.set(this, signal(undefined));
      }

      const stored = store.get(this);
      const value = stored?.value;

      return value;
    },
    set(value: any) {
      const stored = store.get(this);

      if (stored) {
        stored.value = value;
        return;
      }

      store.set(this, signal(value));
    },
  });
}

export function derived(
  target: Object,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const store = new WeakMap<any, Signal<any>>();
  const compute = descriptor.get;

  Object.defineProperty(target, propertyKey, {
    get() {
      if (!compute) {
        return undefined;
      }

      if (!store.get(this)) {
        store.set(this, computed(compute.bind(this)));
      }

      const stored = store.get(this);
      const value = stored?.value;

      return value;
    },
  });
}
