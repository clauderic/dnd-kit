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

// export function reactive<This, Value>(
//   _value: ClassAccessorDecoratorTarget<This, Value>,
//   context: ClassAccessorDecoratorContext
// ): ClassAccessorDecoratorResult<This, Value> | void {
//   const {kind, name} = context;
//   const propertyKey = `#__${String(name)}`;

//   if (kind === 'accessor') {
//     let state: Signal<Value>;

//     return {
//       get(this: This): Value {
//         console.log(`Getting ${String(name)}`);
//         return state.value;
//       },

//       set(this: This, val: Value) {
//         console.log(`Setting ${String(name)} to ${val}`);
//         state.value = val;
//         return val;
//       },

//       init(this: This, initialValue: Value) {
//         console.log(`Initializing ${String(name)} with value ${initialValue}`);
//         state = signal(initialValue);
//         return initialValue;
//       },
//     };
//   }
// }

// export function derived<This, Value>(instance: Value, key: keyof Value) {
//   // const {name, kind} = context;
//   // const propertyKey = `#__${String(name)}`;
//   // console.log(originalMethod, context, args, name, kind);
//   // context.addInitializer(function () {
//   //   const computedSignal = computed(originalMethod.bind(this));
//   //   Object.defineProperty(this, propertyKey, {
//   //     get() {
//   //       return computedSignal;
//   //     },
//   //   });
//   // });
//   // function replacementMethod(this: any) {
//   //   return this[propertyKey].value;
//   // }
//   // return replacementMethod;

//   console.log(instance, key);
// }

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
