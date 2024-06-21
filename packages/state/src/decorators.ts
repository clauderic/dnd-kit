import {signal, type Signal} from '@preact/signals-core';

import {computed} from './computed';

export function reactive(
  {get}: ClassAccessorDecoratorTarget<any, any>,
  _: ClassAccessorDecoratorContext<any, any>
): ClassAccessorDecoratorResult<any, any> {
  return {
    init() {
      return signal(undefined) as any;
    },
    get() {
      const current: Signal = get.call(this);
      return current.value;
    },
    set(newValue: any) {
      const current = get.call(this);

      if (current.peek() === newValue) {
        return;
      }

      current.value = newValue;
    },
  };
}

export function derived<This, Return>(
  target: (this: This) => Return,
  _: ClassGetterDecoratorContext<This, Return>
) {
  const map: WeakMap<any, Signal<Return>> = new WeakMap();

  return function (this: This): Return {
    let result = map.get(this);

    if (!result) {
      result = computed(target.bind(this));

      map.set(this, result);
    }

    return result.value;
  };
}
