import {signal, type Signal} from '@preact/signals-core';

import {computed} from './computed';

export function reactive<This, Value>(
  {get}: ClassAccessorDecoratorTarget<This, Value>,
  _: ClassAccessorDecoratorContext<This, Value>
): ClassAccessorDecoratorResult<This, Value> {
  return {
    init(value: Value) {
      return signal(value) as Value;
    },
    get(): Value {
      const current = get.call(this) as Signal<Value>;
      return current.value;
    },
    set(newValue: Value) {
      const current = get.call(this) as Signal<Value>;

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

/**
 * Make a field enumerable (or non‑enumerable) on every instance.
 *
 *   @enumerable(true)  – enumerable
 *   @enumerable(false) – non‑enumerable
 */
export function enumerable(enumerable: boolean = true) {
  return function (
    _value: unknown,
    context:
      | ClassFieldDecoratorContext<any, any>
      | ClassGetterDecoratorContext<any, any>
      | ClassSetterDecoratorContext<any, any>
      | ClassAccessorDecoratorContext<any, any>
      | ClassMethodDecoratorContext<any, any>
  ) {
    context.addInitializer(function () {
      const host =
        context.kind === 'field' // own field  → instance
          ? this
          : context.static // static member → constructor
            ? this
            : Object.getPrototypeOf(this); // prototype member
      const descriptor = Object.getOwnPropertyDescriptor(host, context.name);

      if (descriptor) {
        Object.defineProperty(host, context.name, {...descriptor, enumerable});
      }
    });
  };
}
