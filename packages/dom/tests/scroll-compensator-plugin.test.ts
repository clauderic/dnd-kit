import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  type Mock,
  spyOn,
} from 'bun:test';
import {signal} from '@dnd-kit/state';

import type {DragDropManager} from '../src/core/manager/index.ts';
import {ScrollCompensator} from '../src/core/plugins/scrolling/ScrollCompensator.ts';

const scrollListenerOptions = {capture: true, passive: true};

function createMockManager() {
  const dragging = signal(false);
  const source = signal<{element: Element} | null>(null);
  const dragEndListeners = new Set<(event: unknown) => void>();

  const manager = {
    dragOperation: {
      status: {
        get dragging() {
          return dragging.value;
        },
      },
      get source() {
        return source.value;
      },
      scrollAdjustment: {x: 0, y: 0},
    },
    monitor: {
      addEventListener: mock((type: string, callback: () => void) => {
        if (type === 'dragend') dragEndListeners.add(callback);
        return () => dragEndListeners.delete(callback);
      }),
    },
    actions: {
      move: mock(),
    },
  } as unknown as DragDropManager;

  const helpers = {
    startDragging(sourceElement: Element | null = null) {
      source.value = sourceElement && {element: sourceElement};
      dragging.value = true;
    },
    stopDragging() {
      dragging.value = false;
    },
    emitDragEnd() {
      [...dragEndListeners].forEach((callback) => callback({type: 'dragend'}));
    },
  };

  return {manager, helpers};
}

function mount(depth = 1) {
  const containers: HTMLElement[] = [];
  let parent: HTMLElement = document.body;

  for (let i = 0; i < depth; i++) {
    const container = document.createElement('div');
    container.style.overflow = 'auto';
    parent.appendChild(container);
    containers.push(container);
    parent = container;
  }

  const source = document.createElement('div');
  parent.appendChild(source);

  return {containers, source};
}

let documentAddEventListener: Mock<typeof document.addEventListener>;
let documentRemoveEventListener: Mock<typeof document.removeEventListener>;

beforeEach(() => {
  document.body.innerHTML = '';
  (document.scrollingElement as HTMLElement).scrollTop = 0;
  (document.scrollingElement as HTMLElement).scrollLeft = 0;

  documentAddEventListener = spyOn(document, 'addEventListener');
  documentRemoveEventListener = spyOn(document, 'removeEventListener');
});

afterEach(() => {
  mock.restore();
});

describe('ScrollCompensator', () => {
  it('does not listen or compensate while not dragging', () => {
    const {
      containers: [container],
    } = mount();
    const {manager} = createMockManager();

    using stack = new DisposableStack();
    stack.adopt(new ScrollCompensator(manager), (plugin) => plugin.destroy());

    container.scrollTop = 100;
    container.dispatchEvent(new Event('scroll'));

    expect(documentAddEventListener).not.toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      scrollListenerOptions
    );
    expect(manager.actions.move).not.toHaveBeenCalled();
    expect(manager.dragOperation.scrollAdjustment).toEqual({x: 0, y: 0});
  });

  it('dispatches a virtual move when a scrollable ancestor scrolls', () => {
    const {
      containers: [container],
      source,
    } = mount();
    const {manager, helpers} = createMockManager();

    using stack = new DisposableStack();
    stack.adopt(new ScrollCompensator(manager), (plugin) => plugin.destroy());

    helpers.startDragging(source);
    container.scrollTop = 100;

    const event = new Event('scroll');
    container.dispatchEvent(event);

    expect(documentAddEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      scrollListenerOptions
    );
    expect(manager.actions.move).toHaveBeenCalledTimes(1);
    expect(manager.actions.move).toHaveBeenCalledWith({event, virtual: true});
  });

  describe('updates scrollAdjustment', () => {
    it('when the document scrolls', () => {
      const scrollingElement = document.scrollingElement as HTMLElement;
      const source = document.createElement('div');
      document.body.appendChild(source);
      scrollingElement.scrollTop = 20; // baseline captured when the drag starts

      const {manager, helpers} = createMockManager();

      using stack = new DisposableStack();
      stack.adopt(new ScrollCompensator(manager), (plugin) => plugin.destroy());

      helpers.startDragging(source);
      scrollingElement.scrollTop = 70;
      document.dispatchEvent(new Event('scroll'));

      expect(manager.dragOperation.scrollAdjustment).toEqual({
        x: 0,
        y: 70 - 20,
      });
    });

    it('when a scrollable container scrolls', () => {
      const {
        containers: [container],
        source,
      } = mount();
      container.scrollTop = 40; // baseline captured when the drag starts
      const {manager, helpers} = createMockManager();

      using stack = new DisposableStack();
      stack.adopt(new ScrollCompensator(manager), (plugin) => plugin.destroy());

      helpers.startDragging(source);
      container.scrollLeft = 20;
      container.scrollTop = 110;
      container.dispatchEvent(new Event('scroll'));

      expect(manager.dragOperation.scrollAdjustment).toEqual({
        x: 20,
        y: 110 - 40,
      });
    });

    it('when the document and nested containers both scroll', () => {
      const scrollingElement = document.scrollingElement as HTMLElement;
      const {
        containers: [outer, inner],
        source,
      } = mount(2);
      // baselines captured when the drag starts
      scrollingElement.scrollTop = 50;
      outer.scrollTop = 20;
      inner.scrollTop = 10;
      const {manager, helpers} = createMockManager();

      using stack = new DisposableStack();
      stack.adopt(new ScrollCompensator(manager), (plugin) => plugin.destroy());

      helpers.startDragging(source);
      scrollingElement.scrollTop = 100;
      outer.scrollTop = 90;
      inner.scrollTop = 40;
      inner.dispatchEvent(new Event('scroll'));

      expect(manager.dragOperation.scrollAdjustment).toEqual({x: 0, y: 150});
    });
  });

  it('ignores scroll events from non-ancestor elements', () => {
    const {source} = mount();
    const unrelated = document.createElement('div');
    unrelated.style.overflow = 'auto';
    document.body.appendChild(unrelated);
    const {manager, helpers} = createMockManager();

    using stack = new DisposableStack();
    stack.adopt(new ScrollCompensator(manager), (plugin) => plugin.destroy());

    helpers.startDragging(source);
    unrelated.scrollTop = 100;
    unrelated.dispatchEvent(new Event('scroll'));

    expect(manager.actions.move).not.toHaveBeenCalled();
  });

  it('stops listening on dragend immediately, before dragging turns false', () => {
    const {
      containers: [container],
      source,
    } = mount();
    const {manager, helpers} = createMockManager();

    using stack = new DisposableStack();
    stack.adopt(new ScrollCompensator(manager), (plugin) => plugin.destroy());

    helpers.startDragging(source);
    helpers.emitDragEnd();

    expect(documentRemoveEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      scrollListenerOptions
    );

    container.scrollTop = 100;
    container.dispatchEvent(new Event('scroll'));
    expect(manager.actions.move).not.toHaveBeenCalled();
  });
});
