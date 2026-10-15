import {describe, expect, it, jest, afterEach} from 'bun:test';
import {ActivationController, DragDropManager} from '@dnd-kit/abstract';

import {DelayConstraint} from '../src/core/sensors/pointer/DelayConstraint.ts';
import {PointerActivationConstraints} from '../src/core/sensors/pointer/PointerActivationConstraints.ts';
import {
  PointerSensor,
  type PointerSensorOptions,
} from '../src/core/sensors/pointer/PointerSensor.ts';
import type {DragDropManager as DomDragDropManager} from '../src/core/manager/index.ts';
import {Draggable} from '../src/core/entities/index.ts';

function createPointerEvent(
  type: string,
  options: Partial<PointerEvent> = {}
): PointerEvent {
  return {
    type,
    pointerId: 1,
    clientX: 0,
    clientY: 0,
    ...options,
  } as unknown as PointerEvent;
}

describe('ActivationController with DelayConstraint', () => {
  it('should activate after the delay elapses', async () => {
    const onActivate = jest.fn();
    const constraint = new DelayConstraint({value: 50, tolerance: 5});
    const controller = new ActivationController([constraint], onActivate);

    controller.onEvent(createPointerEvent('pointerdown'));

    expect(onActivate).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 80));

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('should cancel pending activation when the controller is aborted', async () => {
    const onActivate = jest.fn();
    const constraint = new DelayConstraint({value: 50, tolerance: 5});
    const controller = new ActivationController([constraint], onActivate);

    controller.onEvent(createPointerEvent('pointerdown'));

    expect(onActivate).not.toHaveBeenCalled();

    controller.abort();

    await new Promise((resolve) => setTimeout(resolve, 80));

    expect(onActivate).not.toHaveBeenCalled();
    expect(controller.signal.aborted).toBe(true);
  });

  it('should not activate if aborted just before the delay elapses', async () => {
    const onActivate = jest.fn();
    const constraint = new DelayConstraint({value: 50, tolerance: 5});
    const controller = new ActivationController([constraint], onActivate);

    controller.onEvent(createPointerEvent('pointerdown'));

    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(onActivate).not.toHaveBeenCalled();

    controller.abort();

    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('should cancel activation when pointerup arrives before the delay', async () => {
    const onActivate = jest.fn();
    const constraint = new DelayConstraint({value: 100, tolerance: 5});
    const controller = new ActivationController([constraint], onActivate);

    controller.onEvent(createPointerEvent('pointerdown'));
    controller.onEvent(createPointerEvent('pointerup'));

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(onActivate).not.toHaveBeenCalled();
  });
});

class TestPointerEvent extends Event {
  pointerId = 1;
  pointerType = 'mouse';
  isPrimary = true;
  button = 0;
  clientX: number;
  clientY: number;

  constructor(type: string, init: {clientX?: number; clientY?: number} = {}) {
    super(type, {cancelable: true});
    this.clientX = init.clientX ?? 0;
    this.clientY = init.clientY ?? 0;
  }
}

class TestKeyboardEvent extends Event {}

class TestElement extends EventTarget {
  tagName = 'DIV';
  ownerDocument: Document;

  constructor(ownerDocument: Document) {
    super();
    this.ownerDocument = ownerDocument;
  }
}

// The sensor code only needs the handful of DOM APIs stubbed below, so
// duck-typed EventTarget fakes are enough to drive real event dispatch.
function createTestDocument() {
  const testWindow = Object.assign(new EventTarget(), {
    Element: TestElement,
    HTMLElement: TestElement,
    KeyboardEvent: TestKeyboardEvent,
    PointerEvent: TestPointerEvent,
    frameElement: null,
  }) as unknown as Window & typeof globalThis;

  testWindow.self = testWindow;
  testWindow.parent = testWindow;
  testWindow.top = testWindow;

  const testDocument = Object.assign(new EventTarget(), {
    defaultView: testWindow,
    body: Object.assign(new EventTarget(), {
      setPointerCapture: jest.fn(),
      releasePointerCapture: jest.fn(),
    }),
    querySelectorAll: () => [] as unknown as NodeListOf<Element>,
  }) as unknown as Document;

  return testDocument;
}

/** Flush pending promises and scheduled tasks */
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

describe('PointerSensor', () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    'document'
  );

  afterEach(() => {
    for (const [key, descriptor] of [
      ['window', originalWindow],
      ['document', originalDocument],
    ] as const) {
      if (descriptor) {
        Object.defineProperty(globalThis, key, descriptor);
      } else {
        Reflect.deleteProperty(globalThis, key);
      }
    }
  });

  function setup(
    activationConstraints: PointerSensorOptions['activationConstraints']
  ) {
    const testDocument = createTestDocument();

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: testDocument.defaultView,
    });
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: testDocument,
    });

    const rendering = Promise.withResolvers<void>();
    // The abstract manager carries no DOM plugins, which keeps the test
    // environment minimal; the PointerSensor code under test is unchanged.
    const manager = new DragDropManager({
      renderer: {
        get rendering() {
          return rendering.promise;
        },
      },
    }) as unknown as DomDragDropManager;

    const element = new TestElement(testDocument) as unknown as Element;
    const draggable = new Draggable(
      {id: 'draggable', element, register: false},
      manager
    );
    draggable.register();

    const sensor = new PointerSensor(manager, {activationConstraints});
    const unbind = sensor.bind(draggable);

    return {manager, element, rendering, unbind};
  }

  it('records pointer moves received while the drag operation is initializing', async () => {
    const {manager, element, rendering, unbind} = setup(() => []);
    const dragmove = jest.fn();
    manager.monitor.addEventListener('dragmove', dragmove);

    element.dispatchEvent(
      new TestPointerEvent('pointerdown', {clientX: 10, clientY: 10})
    );

    expect(manager.dragOperation.status.initializing).toBe(true);

    // Move while the operation is still initializing, then hold still
    document.dispatchEvent(
      new TestPointerEvent('pointermove', {clientX: 30, clientY: 40})
    );

    rendering.resolve();
    await flush();

    expect(manager.dragOperation.status.dragging).toBe(true);
    expect(dragmove).toHaveBeenCalled();
    expect(manager.dragOperation.position.current).toMatchObject({
      x: 30,
      y: 40,
    });

    unbind();
    manager.destroy();
  });

  it('records the pointer move that activates the drag operation', async () => {
    const {manager, element, rendering, unbind} = setup(() => [
      new PointerActivationConstraints.Distance({value: 5}),
    ]);
    const dragmove = jest.fn();
    manager.monitor.addEventListener('dragmove', dragmove);

    element.dispatchEvent(
      new TestPointerEvent('pointerdown', {clientX: 10, clientY: 10})
    );

    // This move activates the drag operation
    document.dispatchEvent(
      new TestPointerEvent('pointermove', {clientX: 30, clientY: 40})
    );

    expect(manager.dragOperation.status.initializing).toBe(true);

    rendering.resolve();
    await flush();

    expect(dragmove).toHaveBeenCalled();
    expect(manager.dragOperation.position.current).toMatchObject({
      x: 30,
      y: 40,
    });

    unbind();
    manager.destroy();
  });
});
