import {afterEach, beforeEach, describe, expect, it} from 'bun:test';

import {Accessibility, DragDropManager, Draggable} from '@dnd-kit/dom';

function createMockElement(tagName = 'div', ownerDocument?: any) {
  const attributes = new Map<string, string>();
  const children: any[] = [];
  let parent: any = null;

  const element: any = {
    tagName: tagName.toUpperCase(),
    id: '',
    textContent: '',
    children,
    ownerDocument,
    style: {
      setProperty() {},
    },
    get isConnected() {
      return parent !== null;
    },
    setAttribute(name: string, value: string) {
      attributes.set(name, String(value));
    },
    getAttribute(name: string) {
      return attributes.get(name) ?? null;
    },
    hasAttribute(name: string) {
      return attributes.has(name);
    },
    addEventListener() {},
    removeEventListener() {},
    getRootNode() {
      return ownerDocument;
    },
    appendChild(child: any) {
      children.push(child);
      if (typeof child === 'object' && child !== null) {
        child.__parent = element;
      }
      return child;
    },
    append(...nodes: any[]) {
      for (const node of nodes) {
        children.push(node);
        if (typeof node === 'object' && node !== null) {
          node.__setParent?.(element);
        }
      }
    },
    remove() {
      if (parent) {
        const index = parent.children.indexOf(element);
        if (index !== -1) {
          parent.children.splice(index, 1);
        }
        parent = null;
      }
    },
    __setParent(nextParent: any) {
      parent = nextParent;
    },
  };

  return element;
}

function createMockDocument() {
  const mockWindow = {
    navigator: {userAgent: ''},
    addEventListener() {},
    removeEventListener() {},
  };
  const doc: any = {
    defaultView: mockWindow,
    createElement(tagName: string) {
      return createMockElement(tagName, doc);
    },
    createTextNode(value: string) {
      return {nodeValue: value};
    },
    addEventListener() {},
    removeEventListener() {},
  };
  mockWindow.document = doc;
  doc.body = createMockElement('body', doc);
  doc.body.__setParent(doc);
  return doc;
}

function flushFrame() {
  return new Promise((resolve) => setTimeout(resolve, 25));
}

describe('Accessibility container option', () => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  let mockDocument: any;

  beforeEach(() => {
    mockDocument = createMockDocument();
    Object.defineProperty(globalThis, 'document', {
      value: mockDocument,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: mockDocument.defaultView,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'document', {
      value: originalDocument,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      configurable: true,
      writable: true,
    });
  });

  it('appends status elements to document.body by default', async () => {
    const manager = new DragDropManager({
      sensors: [],
      plugins: [Accessibility.configure({id: 'default-test'})],
    });
    const draggableElement = createMockElement('div', mockDocument);
    const draggable = new Draggable(
      {id: 'item-1', element: draggableElement},
      manager
    );
    draggable.register();

    await flushFrame();

    expect(mockDocument.body.children).toHaveLength(2);
    expect(mockDocument.body.children[0].id).toBe(
      'dnd-kit-description-default-test'
    );
    expect(mockDocument.body.children[1].id).toBe(
      'dnd-kit-announcement-default-test'
    );

    manager.destroy();
    expect(mockDocument.body.children).toHaveLength(0);
  });

  it('appends status elements to a custom Element container', async () => {
    const customContainer = createMockElement('dialog', mockDocument);
    customContainer.__setParent(mockDocument.body);

    const manager = new DragDropManager({
      sensors: [],
      plugins: [
        Accessibility.configure({
          id: 'element-test',
          container: customContainer,
        }),
      ],
    });
    const draggableElement = createMockElement('div', mockDocument);
    const draggable = new Draggable(
      {id: 'item-1', element: draggableElement},
      manager
    );
    draggable.register();

    await flushFrame();

    expect(mockDocument.body.children).toHaveLength(0);
    expect(customContainer.children).toHaveLength(2);
    expect(customContainer.children[0].id).toBe(
      'dnd-kit-description-element-test'
    );
    expect(customContainer.children[1].id).toBe(
      'dnd-kit-announcement-element-test'
    );

    manager.destroy();
    expect(customContainer.children).toHaveLength(0);
  });

  it('appends status elements to a ShadowRoot-like container', async () => {
    const shadowChildren: any[] = [];
    const shadowRoot = {
      ownerDocument: mockDocument,
      children: shadowChildren,
      append(...nodes: any[]) {
        for (const node of nodes) {
          shadowChildren.push(node);
          node.__setParent?.(shadowRoot);
        }
      },
    } as unknown as ShadowRoot;

    const manager = new DragDropManager({
      sensors: [],
      plugins: [
        Accessibility.configure({
          id: 'shadow-test',
          container: shadowRoot,
        }),
      ],
    });
    const draggableElement = createMockElement('div', mockDocument);
    const draggable = new Draggable(
      {id: 'item-1', element: draggableElement},
      manager
    );
    draggable.register();

    await flushFrame();

    expect(mockDocument.body.children).toHaveLength(0);
    expect(shadowChildren).toHaveLength(2);
    expect(shadowChildren[0].id).toBe('dnd-kit-description-shadow-test');
    expect(shadowChildren[1].id).toBe('dnd-kit-announcement-shadow-test');

    manager.destroy();
    expect(shadowChildren).toHaveLength(0);
  });

  it('supports a getter function for container and falls back to document.body when null', async () => {
    const lazyContainer = createMockElement('div', mockDocument);
    lazyContainer.__setParent(mockDocument.body);

    const manager = new DragDropManager({
      sensors: [],
      plugins: [
        Accessibility.configure({
          id: 'fn-test',
          container: () => lazyContainer,
        }),
      ],
    });
    const draggable = new Draggable(
      {id: 'item-1', element: createMockElement('div', mockDocument)},
      manager
    );
    draggable.register();

    await flushFrame();

    expect(mockDocument.body.children).toHaveLength(0);
    expect(lazyContainer.children).toHaveLength(2);
    manager.destroy();

    const fallbackManager = new DragDropManager({
      sensors: [],
      plugins: [
        Accessibility.configure({
          id: 'fallback-test',
          container: () => null,
        }),
      ],
    });
    const fallbackDraggable = new Draggable(
      {id: 'item-2', element: createMockElement('div', mockDocument)},
      fallbackManager
    );
    fallbackDraggable.register();

    await flushFrame();

    expect(mockDocument.body.children).toHaveLength(2);
    fallbackManager.destroy();
  });
});
