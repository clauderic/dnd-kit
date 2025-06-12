import {describe, expect, it} from 'bun:test';
import {deepEqual} from '../src/comparators';

describe('deepEqual', () => {
  it('should return true for same primitives', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual('a', 'a')).toBe(true);
    expect(deepEqual(true, true)).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
  });

  it('should return false for different primitives', () => {
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual('a', 'b')).toBe(false);
  });

  it('should compare functions by reference', () => {
    const fn1 = () => {};
    const fn2 = () => {};
    expect(deepEqual(fn1, fn1)).toBe(true);
    expect(deepEqual(fn1, fn2)).toBe(false);
  });

  it('should compare arrays deeply', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);
  });

  it('should compare sets', () => {
    expect(deepEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true);
    expect(deepEqual(new Set([1, 2]), new Set([1, 2, 3]))).toBe(false);
  });

  it('should compare plain objects', () => {
    expect(deepEqual({a: 1}, {a: 1})).toBe(true);
    expect(deepEqual({a: 1, b: 2}, {b: 2, a: 1})).toBe(true);
    expect(deepEqual({a: 1}, {a: 2})).toBe(false);
  });

  it('should detect differing values when only some keys match', () => {
    expect(deepEqual({a: 1, b: 1}, {a: 1, b: 2})).toBe(false);
  });
});
