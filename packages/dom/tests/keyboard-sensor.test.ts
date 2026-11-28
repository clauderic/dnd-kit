import {describe, expect, it} from 'bun:test';
import {DragDropManager as AbstractDragDropManager} from '@dnd-kit/abstract';
import {
  AutoScroller,
  type DragDropManager,
  Draggable,
  KeyboardSensor,
  Scroller,
} from '@dnd-kit/dom';

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

class TestKeyboardEvent extends Event {
  constructor(public key: string) {
    super('keydown', {cancelable: true});
  }
}

class TestElement extends EventTarget {
  parentNode = null;
  ownerDocument: Document;

  constructor(ownerDocument: Document) {
    super();
    this.ownerDocument = ownerDocument;
  }

  getBoundingClientRect() {
    return {width: 10, height: 10, top: 0, left: 0, bottom: 10, right: 10};
  }

  getAnimations() {
    return [];
  }
}

describe('KeyboardSensor cleanup', () => {
  it.each([
    {end: 'manager.actions.stop()', wasDisabled: false},
    {end: 'manager.actions.stop()', wasDisabled: true},
    {end: 'Escape', wasDisabled: false},
  ])(
    'cleans up after $end (AutoScroller initially disabled: $wasDisabled)',
    async ({end, wasDisabled}) => {
      const testWindow = {
        Document: class {},
        Element: TestElement,
        HTMLElement: TestElement,
        KeyboardEvent: TestKeyboardEvent,
        frameElement: null,
        getComputedStyle: () => ({transform: 'none'}),
      };
      const testDocument = Object.assign(new EventTarget(), {
        defaultView: testWindow,
        getAnimations: () => [],
      }) as unknown as Document;
      const globals = {window: testWindow, document: testDocument};
      const originalGlobals = Object.keys(globals).map(
        (key) =>
          [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const
      );
      for (const [key, value] of Object.entries(globals)) {
        Object.defineProperty(globalThis, key, {configurable: true, value});
      }

      const manager = new AbstractDragDropManager({
        plugins: [Scroller, AutoScroller],
        sensors: [KeyboardSensor],
      }) as unknown as DragDropManager;

      try {
        manager.registry.plugins.get(Scroller)!.disable();
        const autoScroller = manager.registry.plugins.get(AutoScroller)!;
        if (wasDisabled) {
          autoScroller.disable();
        }

        const element = new TestElement(testDocument);
        const source = new Draggable(
          {
            id: 'draggable',
            element: element as unknown as Element,
            register: false,
          },
          manager
        );
        source.register();
        element.dispatchEvent(new TestKeyboardEvent('Enter'));
        await manager.renderer.rendering;

        expect(manager.dragOperation.status.dragging).toBe(true);
        expect(autoScroller.disabled).toBe(true);

        if (end === 'Escape') {
          testDocument.dispatchEvent(new TestKeyboardEvent('Escape'));
        } else {
          manager.actions.stop();
        }

        const scrollerDisabled = autoScroller.disabled;
        const tab = new TestKeyboardEvent('Tab');
        testDocument.dispatchEvent(tab);
        expect({
          defaultPrevented: tab.defaultPrevented,
          scrollerDisabled,
        }).toEqual({defaultPrevented: false, scrollerDisabled: wasDisabled});
      } finally {
        manager.destroy();
        for (const [key, descriptor] of originalGlobals) {
          if (descriptor) {
            Object.defineProperty(globalThis, key, descriptor);
          } else {
            Reflect.deleteProperty(globalThis, key);
          }
        }
      }
    }
  );
});
