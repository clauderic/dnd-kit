import {describe, expect, it} from 'bun:test';
import {effect, signal} from '@preact/signals-core';

import {snapshot} from '../src/snapshot';

describe('snapshot', () => {
  it('copies __proto__ as data without changing the returned prototype', () => {
    const input = JSON.parse(
      '{"__proto__":{"isAdmin":true},"constructor":{"prototype":{"enabled":true}},"prototype":{"name":"value"}}'
    );

    const result = snapshot(input);

    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(result.isAdmin).toBeUndefined();
    expect(Object.getOwnPropertyDescriptor(result, '__proto__')).toEqual({
      value: input.__proto__,
      enumerable: true,
      configurable: true,
      writable: true,
    });
    expect(Object.prototype.hasOwnProperty.call(result, 'constructor')).toBe(
      true
    );
    expect(result.constructor).toBe(input.constructor);
    expect(Object.prototype.hasOwnProperty.call(result, 'prototype')).toBe(
      true
    );
    expect(result.prototype).toBe(input.prototype);
    expect(JSON.stringify(result)).toBe(JSON.stringify(input));
    expect(
      Object.prototype.hasOwnProperty.call(Object.prototype, 'isAdmin')
    ).toBe(false);
  });

  it('preserves an enumerable inherited __proto__ property as own data', () => {
    const inherited = JSON.parse('{"__proto__":null}');
    const result = snapshot(Object.create(inherited));

    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(
      true
    );
    expect(result.__proto__).toBeNull();
    expect(result.toString()).toBe('[object Object]');
  });

  it('captures inherited reactive getters without subscribing to them', () => {
    const current = signal(1);
    const prototype = Object.defineProperty({}, 'current', {
      get: () => current.value,
      enumerable: true,
    });
    const input = Object.create(prototype);
    input.name = 'example';
    let runs = 0;
    let result: typeof input;
    const dispose = effect(() => {
      runs++;
      result = snapshot(input);
    });

    try {
      expect(result).toEqual({name: 'example', current: 1});
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      expect(Object.getOwnPropertyDescriptor(result, 'current')).toEqual({
        value: 1,
        enumerable: true,
        configurable: true,
        writable: true,
      });

      current.value = 2;

      expect(runs).toBe(1);
      expect(result.current).toBe(1);
      expect(snapshot(input).current).toBe(2);
    } finally {
      dispose();
    }
  });
});
