import {signal, Signal} from '@preact/signals-core';

export class ProxyState<T> extends Signal<T> {}

export function proxy<T>(value: T): ProxyState<T> {
  return signal(value);
}
