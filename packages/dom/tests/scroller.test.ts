import {describe, expect, it, jest} from 'bun:test';
import {DragDropManager, Draggable, Droppable} from '@dnd-kit/abstract';
import {Scroller} from '@dnd-kit/dom';
import type {DragDropManager as DomDragDropManager} from '@dnd-kit/dom';

describe('Scroller shouldScroll', () => {
  it('skips a scrollable candidate when shouldScroll returns false', () => {
    const {manager, scroller, scrollable, source, target} = setup();
    const shouldScroll = jest.fn((args) => {
      expect(args.scrollable).toBe(scrollable);
      expect(args.source).toBe(source);
      expect(args.target).toBe(target);
      expect(args.manager).toBe(manager);

      return false;
    });

    expect(scroller.scroll({by: {x: 0, y: 1}}, {shouldScroll})).toBe(false);
    expect(shouldScroll).toHaveBeenCalledTimes(1);
    expect(scrollable.scrollTop).toBe(0);

    manager.destroy();
  });

  it('preserves scrolling when shouldScroll returns true', () => {
    const {manager, scroller, scrollable} = setup();
    const restoreWindow = mockWindow(scrollable);

    manager.dragOperation.position.current = {x: 50, y: 95};

    try {
      expect(
        scroller.scroll(
          {by: {x: 0, y: 1}},
          {
            acceleration: 20,
            shouldScroll: () => true,
            threshold: {x: 0, y: 0.2},
          }
        )
      ).toBe(true);
      expect(scrollable.scrollTop).toBeGreaterThan(0);
    } finally {
      restoreWindow();
      manager.destroy();
    }
  });
});

function setup() {
  const manager = new DragDropManager({
    plugins: [Scroller as any],
  });
  const scroller = manager.registry.plugins.get(Scroller as any) as Scroller;
  const source = new Draggable({id: 'source', register: false}, manager);
  const target = new Droppable(
    {
      id: 'target',
      collisionDetector: () => [],
      register: false,
    },
    manager
  );
  const scrollable = createScrollable();

  manager.registry.register(source);
  manager.registry.register(target);
  manager.dragOperation.sourceIdentifier = source.id;
  manager.dragOperation.targetIdentifier = target.id;
  scroller.getScrollableElements = () => new Set([scrollable]);

  return {
    manager: manager as unknown as DomDragDropManager,
    scroller,
    scrollable,
    source,
    target,
  };
}

function createScrollable() {
  const scrollable = {
    clientHeight: 100,
    clientWidth: 100,
    getBoundingClientRect: () => ({
      bottom: 100,
      height: 100,
      left: 0,
      right: 100,
      top: 0,
      width: 100,
      x: 0,
      y: 0,
    }),
    namespaceURI: 'http://www.w3.org/1999/xhtml',
    nodeType: 1,
    offsetHeight: 100,
    offsetWidth: 100,
    ownerDocument: undefined as unknown as Document,
    scrollHeight: 300,
    scrollLeft: 0,
    scrollTop: 0,
    scrollWidth: 100,
  };

  return scrollable as unknown as Element & {
    ownerDocument: Document;
    scrollTop: number;
  };
}

function mockWindow(scrollable: Element) {
  const global = globalThis as typeof globalThis & {window?: unknown};
  const previousWindow = global.window;
  const fakeWindow = {
    frameElement: null,
    getComputedStyle: () => ({
      height: '100px',
      scale: 'none',
      transform: 'none',
      translate: 'none',
      width: '100px',
    }),
    HTMLElement: class HTMLElement {},
    parent: null as unknown,
    self: null as unknown,
    SVGElement: class SVGElement {},
  };
  const ownerDocument = {defaultView: fakeWindow};

  fakeWindow.parent = fakeWindow;
  fakeWindow.self = fakeWindow;
  (scrollable as Element & {ownerDocument: unknown}).ownerDocument =
    ownerDocument;
  global.window = fakeWindow;

  return () => {
    if (previousWindow === undefined) {
      delete global.window;
    } else {
      global.window = previousWindow;
    }
  };
}
