import {describe, expect, it} from 'bun:test';
import {DragDropManager, Draggable, Modifier} from '@dnd-kit/abstract';
import {SnapModifier} from '@dnd-kit/abstract/modifiers';
import {
  KeyboardSensor,
  type DragDropManager as DomDragDropManager,
} from '@dnd-kit/dom';
import {Rectangle} from '@dnd-kit/geometry';

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

/** Stops the item 20px left of where the drag started, like an edge. */
class LeftEdgeModifier extends Modifier {
  public apply({transform}: Parameters<Modifier['apply']>[0]) {
    return {...transform, x: Math.max(transform.x, -20)};
  }
}

/** Renders the item 8px above its tracked position. */
class LiftModifier extends Modifier {
  public apply({transform}: Parameters<Modifier['apply']>[0]) {
    return {...transform, y: transform.y - 8};
  }
}

class TestKeyboardSensor extends KeyboardSensor {
  press(direction: 'up' | 'down' | 'left' | 'right') {
    this.handleMove(direction, {
      shiftKey: false,
      preventDefault() {},
    } as unknown as KeyboardEvent);
  }
}

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

async function startKeyboardDrag(modifiers: Modifier['constructor'][]) {
  const manager = new DragDropManager({modifiers: modifiers as any});
  const draggable = new Draggable({id: 'd1', register: false}, manager);
  draggable.register();

  manager.actions.start({source: draggable, coordinates: {x: 0, y: 0}});
  manager.dragOperation.shape = new Rectangle(0, 0, 10, 10);
  await flush();

  const sensor = new TestKeyboardSensor(
    manager as unknown as DomDragDropManager
  );
  const press = async (
    direction: 'up' | 'down' | 'left' | 'right',
    times = 1
  ) => {
    for (let i = 0; i < times; i++) {
      sensor.press(direction);
      await flush();
    }
    return manager.dragOperation.transform;
  };

  return {manager, press};
}

describe('KeyboardSensor with modifiers', () => {
  it('moves back immediately after pressing past a restricted edge', async () => {
    const {manager, press} = await startKeyboardDrag([LeftEdgeModifier]);

    expect((await press('left', 5)).x).toBe(-20);
    expect((await press('right')).x).toBe(-10);

    manager.destroy();
  });

  it('moves one grid step per key press with the snap modifier', async () => {
    const {manager, press} = await startKeyboardDrag([
      SnapModifier.configure({size: 20}) as any,
    ]);

    expect((await press('right')).x).toBe(20);
    expect((await press('right')).x).toBe(40);
    expect((await press('right')).x).toBe(60);

    manager.destroy();
  });

  it('keeps the step size with a modifier that offsets the item', async () => {
    const {manager, press} = await startKeyboardDrag([LiftModifier]);

    expect((await press('down', 2)).y).toBe(12);
    expect((await press('up')).y).toBe(2);

    manager.destroy();
  });
});
