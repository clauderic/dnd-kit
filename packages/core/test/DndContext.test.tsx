/**
 * @jest-environment jsdom
 */
import React from 'react';
import {act} from 'react-dom/test-utils';

import {DndContext, KeyboardSensor, MouseSensor, useDraggable} from '../src';
import type {
  SensorDescriptor,
  SensorInstance,
  SensorOptions,
  SensorProps,
} from '../src';

interface Root {
  render(children: React.ReactNode): void;
  unmount(): void;
}

// The repository's @types/react-dom predates React 18 and does not
// include typings for `react-dom/client`.
const {createRoot} = require('react-dom/client') as {
  createRoot(container: Element): Root;
};

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function Draggable() {
  const {attributes, listeners, setNodeRef} = useDraggable({id: 'draggable'});

  return (
    <button ref={setNodeRef} {...attributes} {...listeners}>
      Draggable
    </button>
  );
}

function setup(sensors: SensorDescriptor<any>[]) {
  const onDragStart = jest.fn();
  const onDragEnd = jest.fn();
  const onDragCancel = jest.fn();
  const container = document.createElement('div');
  const root = createRoot(container);

  document.body.appendChild(container);

  act(() => {
    root.render(
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <Draggable />
      </DndContext>
    );
  });

  const activator = container.querySelector('button') as HTMLButtonElement;

  return {
    activator,
    onDragStart,
    onDragEnd,
    onDragCancel,
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

function createInput() {
  const input = document.createElement('input');

  document.body.appendChild(input);
  input.focus();

  return input;
}

function keyDown(target: EventTarget, code: string) {
  const event = new KeyboardEvent('keydown', {
    code,
    bubbles: true,
    cancelable: true,
  });

  act(() => {
    target.dispatchEvent(event);
  });

  return event;
}

function mouse(
  target: EventTarget,
  type: 'mousedown' | 'mousemove' | 'mouseup'
) {
  const event = new MouseEvent(type, {
    button: 0,
    bubbles: true,
    cancelable: true,
  });

  act(() => {
    target.dispatchEvent(event);
  });

  return event;
}

function flushTimers() {
  return act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

const keyboardSensor: SensorDescriptor<any>[] = [
  {sensor: KeyboardSensor, options: {}},
];
const mouseSensor: SensorDescriptor<any>[] = [
  {sensor: MouseSensor, options: {}},
];

describe('DndContext', () => {
  beforeAll(() => {
    // jsdom does not implement `scrollIntoView`, which the KeyboardSensor
    // calls when a drag operation starts.
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('when unmounted during a drag operation', () => {
    it('removes the listeners of the KeyboardSensor', async () => {
      const {activator, onDragStart, onDragEnd, onDragCancel, unmount} =
        setup(keyboardSensor);

      activator.focus();
      keyDown(activator, 'Space');
      // The KeyboardSensor attaches its keydown listener on the next tick
      await flushTimers();

      expect(onDragStart).toHaveBeenCalledTimes(1);
      expect(keyDown(document.body, 'ArrowDown').defaultPrevented).toBe(true);

      unmount();

      const input = createInput();

      expect(keyDown(input, 'ArrowDown').defaultPrevented).toBe(false);
      expect(keyDown(input, 'Space').defaultPrevented).toBe(false);
      expect(onDragEnd).not.toHaveBeenCalled();
      expect(onDragCancel).not.toHaveBeenCalled();
    });

    it('does not attach the listeners of the KeyboardSensor when unmounted before they are attached', async () => {
      const {activator, onDragStart, onDragEnd, onDragCancel, unmount} =
        setup(keyboardSensor);

      activator.focus();
      keyDown(activator, 'Space');

      expect(onDragStart).toHaveBeenCalledTimes(1);

      unmount();
      await flushTimers();

      const input = createInput();

      expect(keyDown(input, 'Space').defaultPrevented).toBe(false);
      expect(onDragEnd).not.toHaveBeenCalled();
      expect(onDragCancel).not.toHaveBeenCalled();
    });

    it('removes the listeners of the MouseSensor', () => {
      const {activator, onDragStart, onDragEnd, onDragCancel, unmount} =
        setup(mouseSensor);

      mouse(activator, 'mousedown');

      expect(onDragStart).toHaveBeenCalledTimes(1);

      unmount();

      expect(mouse(document, 'mousemove').defaultPrevented).toBe(false);
      mouse(document, 'mouseup');
      expect(onDragEnd).not.toHaveBeenCalled();
      expect(onDragCancel).not.toHaveBeenCalled();
    });

    it('calls the teardown method of custom sensors', () => {
      const teardown = jest.fn();

      class CustomSensor implements SensorInstance {
        static activators = [
          {eventName: 'onMouseDown' as const, handler: () => true},
        ];

        public autoScrollEnabled = false;

        constructor({onStart}: SensorProps<SensorOptions>) {
          onStart({x: 0, y: 0});
        }

        public teardown() {
          teardown();
        }
      }

      const {activator, onDragStart, unmount} = setup([
        {sensor: CustomSensor, options: {}},
      ]);

      mouse(activator, 'mousedown');

      expect(onDragStart).toHaveBeenCalledTimes(1);
      expect(teardown).not.toHaveBeenCalled();

      unmount();

      expect(teardown).toHaveBeenCalledTimes(1);
    });
  });
});
