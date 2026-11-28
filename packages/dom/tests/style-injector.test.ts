import {expect, it} from 'bun:test';
import {DragDropManager} from '@dnd-kit/abstract';
import {
  type DragDropManager as DomDragDropManager,
  Draggable,
  StyleInjector,
} from '@dnd-kit/dom';

class TestDocument {
  head = new TestHead();
  defaultView = {Document: TestDocument};

  createElement() {
    return new TestStyle(this.head);
  }
}

class TestHead {
  styles: TestStyle[] = [];
  observers = new Set<TestMutationObserver>();

  prepend(style: TestStyle) {
    style.remove();
    this.styles.unshift(style);
  }

  append(style: TestStyle) {
    this.styles.push(style);
  }
}

class TestStyle {
  textContent = '';
  nonce = '';

  constructor(private head: TestHead) {}

  setAttribute(_name: string, value: string) {
    this.nonce = value;
  }

  remove() {
    const index = this.head.styles.indexOf(this);
    if (index !== -1) {
      this.head.styles.splice(index, 1);
      for (const observer of this.head.observers) {
        observer.notify(this);
      }
    }
  }
}

class TestMutationObserver {
  private head?: TestHead;

  constructor(
    private callback: (entries: {removedNodes: TestStyle[]}[]) => void
  ) {}

  observe(head: TestHead) {
    this.head = head;
    head.observers.add(this);
  }

  disconnect() {
    this.head?.observers.delete(this);
  }

  notify(style: TestStyle) {
    queueMicrotask(() => {
      if (this.head?.observers.has(this)) {
        this.callback([{removedNodes: [style]}]);
      }
    });
  }
}

it('reserves the document layer before a drag and restores removed sheets in order', async () => {
  const testDocument = new TestDocument();
  const globals = {
    document: testDocument,
    window: testDocument.defaultView,
    MutationObserver: TestMutationObserver,
  };
  const originals = Object.keys(globals).map(
    (key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const
  );
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, {configurable: true, value});
  }

  const existing = testDocument.createElement();
  existing.textContent = '@layer components { .item { color: red; } }';
  testDocument.head.append(existing);
  const defaultManager = new DragDropManager({plugins: [StyleInjector]});
  const [order] = testDocument.head.styles;
  const manager = new DragDropManager({
    plugins: [StyleInjector.configure({nonce: 'test-nonce'})],
  }) as unknown as DomDragDropManager;

  try {
    const injector = manager.registry.plugins.get(StyleInjector)!;
    const cssRules = '@layer dnd-kit { .item { color: blue; } }';
    injector.register(cssRules);

    expect(testDocument.head.styles.map((style) => style.textContent)).toEqual([
      '@layer dnd-kit;',
      existing.textContent,
    ]);
    expect(testDocument.head.styles[0]).toBe(order);
    expect(order.nonce).toBe('test-nonce');

    const source = new Draggable({id: 'source', register: false}, manager);
    source.register();
    manager.actions.start({source, coordinates: {x: 0, y: 0}});
    await manager.renderer.rendering;

    const rules = testDocument.head.styles.at(-1)!;
    expect(rules.textContent).toBe(cssRules);
    expect(rules.nonce).toBe('test-nonce');
    expect(testDocument.head.styles).toEqual([order, existing, rules]);

    rules.remove();
    order.remove();
    await Promise.resolve();
    expect(testDocument.head.styles).toEqual([order, existing, rules]);

    manager.actions.stop();
    await manager.renderer.rendering;
    await manager.renderer.rendering;
    expect(testDocument.head.styles).toEqual([order, existing]);
  } finally {
    manager.destroy();
    defaultManager.destroy();
    for (const [key, descriptor] of originals) {
      if (descriptor) {
        Object.defineProperty(globalThis, key, descriptor);
      } else {
        Reflect.deleteProperty(globalThis, key);
      }
    }
  }

  await Promise.resolve();
  expect(testDocument.head.styles).toEqual([existing]);
});
