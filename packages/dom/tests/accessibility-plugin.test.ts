import {afterEach, beforeEach, describe, expect, it} from 'bun:test';
import {DragDropManager} from '@dnd-kit/abstract';

import {Accessibility, Draggable} from '@dnd-kit/dom';

interface MockElement {
  tagName: string;
  isConnected: boolean;
  style: Record<string, any> & {
    setProperty(name: string, value: string): void;
  };
  id: string;
  readCount: number;
  attributes: Map<string, string>;
  hasAttribute(name: string): boolean;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  appendChild(child: any): void;
  append(...nodes: any[]): void;
  remove(): void;
  setAttributeNS?: any;
}

function createMockElement(
  tagName = 'div',
  initialAttributes: Record<string, string> = {}
): MockElement & Element {
  const attributes = new Map<string, string>(Object.entries(initialAttributes));
  const children: any[] = [];
  const style: MockElement['style'] = {
    setProperty(name: string, value: string) {
      style[name] = value;
    },
  };

  const element: MockElement = {
    tagName: tagName.toUpperCase(),
    isConnected: false,
    style,
    id: '',
    readCount: 0,
    attributes,
    hasAttribute(name: string) {
      element.readCount++;
      return attributes.has(name);
    },
    getAttribute(name: string) {
      element.readCount++;
      return attributes.get(name) ?? null;
    },
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
    appendChild(child: any) {
      children.push(child);
    },
    append(...nodes: any[]) {
      for (const node of nodes) {
        node.isConnected = true;
        children.push(node);
      }
    },
    remove() {
      element.isConnected = false;
    },
  };

  return element as unknown as MockElement & Element;
}

describe('Accessibility plugin', () => {
  const originalDocument = globalThis.document;
  const originalNavigator = globalThis.navigator;
  const originalRAF = globalThis.requestAnimationFrame;

  let scheduledCallbacks: Array<() => void> = [];
  let bodyChildren: MockElement[] = [];

  function flushAnimationFrames() {
    const callbacks = scheduledCallbacks;
    scheduledCallbacks = [];
    for (const cb of callbacks) {
      cb();
    }
  }

  beforeEach(() => {
    scheduledCallbacks = [];
    bodyChildren = [];

    const mockBody = {
      append(...nodes: any[]) {
        for (const node of nodes) {
          node.isConnected = true;
          bodyChildren.push(node);
        }
      },
    };

    (globalThis as any).document = {
      body: mockBody,
      createElement(tag: string) {
        return createMockElement(tag);
      },
      createTextNode(text: string) {
        return {nodeValue: text};
      },
    };

    (globalThis as any).navigator = {
      userAgent:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    };

    (globalThis as any).requestAnimationFrame = (cb: () => void) => {
      scheduledCallbacks.push(cb);
      return scheduledCallbacks.length;
    };
  });

  afterEach(() => {
    (globalThis as any).document = originalDocument;
    (globalThis as any).navigator = originalNavigator;
    (globalThis as any).requestAnimationFrame = originalRAF;
  });

  it('defers DOM attribute reads to the scheduled frame in O(n) rather than O(n^2)', () => {
    const manager = new DragDropManager();
    const plugin = new Accessibility(manager as any, {id: 'test-o-n'});

    const elements = Array.from({length: 20}, () => createMockElement('a'));
    const draggables = elements.map(
      (element, index) =>
        new Draggable({id: `item-${index}`, element}, manager as any)
    );

    for (const draggable of draggables) {
      draggable.register();
    }

    // Before the frame flushes, no DOM attribute reads should have happened
    const readsBeforeFlush = elements.reduce(
      (sum, el) => sum + el.readCount,
      0
    );
    expect(readsBeforeFlush).toBe(0);
    expect(scheduledCallbacks.length).toBe(1);

    flushAnimationFrames();

    // Each element should only have been inspected once in the single flushed task
    const readsAfterFlush = elements.map((el) => el.readCount);
    const firstElementReads = readsAfterFlush[0];
    expect(firstElementReads).toBeGreaterThan(0);
    for (const count of readsAfterFlush) {
      expect(count).toBe(firstElementReads);
    }

    plugin.destroy();
    manager.destroy();
  });

  it('sets expected accessibility attributes and reacts to state changes', async () => {
    const manager = new DragDropManager();
    const plugin = new Accessibility(manager as any, {id: 'test-attrs'});

    const element = createMockElement('div');
    const draggable = new Draggable({id: 'item-1', element}, manager as any);
    draggable.register();

    flushAnimationFrames();

    expect(element.getAttribute('tabindex')).toBe('0');
    expect(element.getAttribute('role')).toBe('button');
    expect(element.getAttribute('aria-roledescription')).toBe('draggable');
    expect(element.getAttribute('aria-describedby')).toContain('test-attrs');
    expect(element.getAttribute('aria-pressed')).toBe('false');
    expect(element.getAttribute('aria-grabbed')).toBe('false');
    expect(element.getAttribute('aria-disabled')).toBe('false');

    // Start dragging and verify aria-pressed / aria-grabbed update
    manager.actions.start({source: draggable, coordinates: {x: 0, y: 0}});
    draggable.status = 'dragging';
    flushAnimationFrames();

    expect(element.getAttribute('aria-pressed')).toBe('true');
    expect(element.getAttribute('aria-grabbed')).toBe('true');

    // Update disabled state
    draggable.disabled = true;

    flushAnimationFrames();

    expect(element.getAttribute('aria-disabled')).toBe('true');

    // Update handle and verify new activator receives attributes
    const handle = createMockElement('button');
    draggable.handle = handle;

    flushAnimationFrames();

    expect(handle.hasAttribute('role')).toBe(false);
    expect(handle.hasAttribute('tabindex')).toBe(false);
    expect(handle.getAttribute('aria-roledescription')).toBe('draggable');
    expect(handle.getAttribute('aria-describedby')).toContain('test-attrs');
    expect(handle.getAttribute('aria-pressed')).toBe('true');
    expect(handle.getAttribute('aria-grabbed')).toBe('true');
    expect(handle.getAttribute('aria-disabled')).toBe('true');

    plugin.destroy();
    manager.destroy();
  });

  it('cancels pending attribute sync when destroyed before frame flush', () => {
    const manager = new DragDropManager();
    const plugin = new Accessibility(manager as any, {id: 'test-destroy'});

    const element = createMockElement('div');
    const draggable = new Draggable({id: 'item-1', element}, manager as any);
    draggable.register();

    plugin.destroy();
    flushAnimationFrames();

    expect(element.attributes.size).toBe(0);
    expect(bodyChildren.length).toBe(0);

    manager.destroy();
  });
});
