import {describe, expect, it} from 'bun:test';

import {isKeyboardKey} from '../src/core/sensors/keyboard/KeyboardSensor.helpers.ts';

function createKeyboardEvent({
  code,
  key,
  shiftKey = false,
}: {
  code: string;
  key: string;
  shiftKey?: boolean;
}) {
  return {
    code,
    key,
    shiftKey,
  } as KeyboardEvent;
}

describe('KeyboardSensor key matching', () => {
  it('uses the logical keyboard key instead of the physical code', () => {
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'Escape', code: 'CapsLock'}), [
        'Escape',
      ])
    ).toBe(true);
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'CapsLock', code: 'Escape'}), [
        'Escape',
      ])
    ).toBe(false);
  });

  it('keeps Space as an alias when matching KeyboardEvent.key', () => {
    expect(
      isKeyboardKey(createKeyboardEvent({key: ' ', code: 'KeyA'}), [
        'Space',
        'Enter',
      ])
    ).toBe(true);
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'a', code: 'Space'}), [
        'Space',
        'Enter',
      ])
    ).toBe(false);
  });

  it('normalizes printable character keys for configured movement keys', () => {
    expect(
      isKeyboardKey(
        createKeyboardEvent({key: 'W', code: 'KeyW', shiftKey: true}),
        ['w']
      )
    ).toBe(true);
  });

  it('keeps Key* and Digit* aliases for common legacy KeyboardEvent.code configs', () => {
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'w', code: 'KeyW'}), ['KeyW'])
    ).toBe(true);
    expect(
      isKeyboardKey(createKeyboardEvent({key: '1', code: 'Digit1'}), ['Digit1'])
    ).toBe(true);
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'Enter', code: 'NumpadEnter'}), [
        'NumpadEnter',
      ])
    ).toBe(false);
  });

  it('matches common named keys without requiring exact casing', () => {
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'Enter', code: 'Enter'}), [
        'enter',
      ])
    ).toBe(true);
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'Escape', code: 'Escape'}), [
        'escape',
      ])
    ).toBe(true);
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'ArrowUp', code: 'ArrowUp'}), [
        'arrowup',
      ])
    ).toBe(true);
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'Insert', code: 'Insert'}), [
        'insert',
      ])
    ).toBe(true);
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'F1', code: 'F1'}), ['f1'])
    ).toBe(true);
  });

  it('matches the documented default KeyboardSensor bindings', () => {
    expect(
      isKeyboardKey(createKeyboardEvent({key: ' ', code: 'Space'}), [
        'Space',
        'Enter',
      ])
    ).toBe(true);
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'Enter', code: 'Enter'}), [
        'Space',
        'Enter',
      ])
    ).toBe(true);
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'Escape', code: 'Escape'}), [
        'Escape',
      ])
    ).toBe(true);
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'Tab', code: 'Tab'}), [
        'Space',
        'Enter',
        'Tab',
      ])
    ).toBe(true);
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'ArrowUp', code: 'ArrowUp'}), [
        'ArrowUp',
      ])
    ).toBe(true);
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'ArrowDown', code: 'ArrowDown'}), [
        'ArrowDown',
      ])
    ).toBe(true);
    expect(
      isKeyboardKey(createKeyboardEvent({key: 'ArrowLeft', code: 'ArrowLeft'}), [
        'ArrowLeft',
      ])
    ).toBe(true);
    expect(
      isKeyboardKey(
        createKeyboardEvent({key: 'ArrowRight', code: 'ArrowRight'}),
        ['ArrowRight']
      )
    ).toBe(true);
  });
});
