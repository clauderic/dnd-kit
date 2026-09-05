/// <reference types="bun-types" />

import {mock} from 'bun:test';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import type {DragDropManager, Droppable} from '@dnd-kit/dom';
import {Rectangle} from '@dnd-kit/geometry';

// Load the sortable entry before either plugin to preserve their module cycle.
import {Sortable} from '../../sortable.ts';
export function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((a, b) => {
    resolve = a;
    reject = b;
  });
  return {promise, resolve, reject};
}

export async function flush() {
  for (let i = 0; i < 30; i++) await Promise.resolve();
}

export function preventable<T extends object>(properties: T) {
  return {
    ...properties,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
  };
}

export class KeyboardEventFixture {
  constructor(public target: Element) {}
}

export class ElementFixture {
  nodeType = 1;
  parentElement: ElementFixture | null = null;
  children: ElementFixture[] = [];
  ownerDocument!: Document;

  constructor(public rectangle = new Rectangle(0, 0, 100, 60)) {}

  contains(element: ElementFixture): boolean {
    return (
      element === this || this.children.some((child) => child.contains(element))
    );
  }

  getBoundingClientRect() {
    return this.rectangle.boundingRectangle;
  }

  getAnimations() {
    return [];
  }

  getRootNode() {
    return this.ownerDocument;
  }

  insertAdjacentElement = mock((position: string, element: ElementFixture) => {
    const previousParent = element.parentElement;
    if (previousParent) {
      previousParent.children.splice(
        previousParent.children.indexOf(element),
        1
      );
    }
    const parent = this.parentElement!;
    const index =
      parent.children.indexOf(this) + (position === 'afterend' ? 1 : 0);
    parent.children.splice(index, 0, element);
    element.parentElement = parent;
    parent.children.forEach((child, index) => {
      child.rectangle = new Rectangle(0, index * 60, 100, 60);
    });
  });
}

// Real sortable entities and geometry, with only event delivery, rendering and
// the small DOM surface used by these plugins supplied by the fixture.
export function createSetup(count = 3) {
  const listeners = new Map<
    string,
    Set<(event: any, manager: DragDropManager) => unknown>
  >();
  const document = {
    nodeType: 9,
    getAnimations: () => [],
  } as unknown as Document;
  const view = {
    document,
    frameElement: null,
    innerWidth: 1000,
    innerHeight: 1000,
    KeyboardEvent: KeyboardEventFixture,
    HTMLElement: class {},
    ShadowRoot: class {},
    getComputedStyle: () => ({
      transform: 'none',
      translate: 'none',
      scale: 'none',
    }),
  };
  Object.assign(view, {self: view, parent: view});
  Object.assign(document, {defaultView: view});
  const parent = new ElementFixture(new Rectangle(0, 0, 100, count * 60));
  parent.ownerDocument = document;
  Object.assign(document, {documentElement: parent});
  const items = Array.from({length: count}, (_, index) => {
    const element = new ElementFixture(new Rectangle(0, index * 60, 100, 60));
    element.ownerDocument = document;
    element.parentElement = parent;
    parent.children.push(element);
    const sortable = new Sortable(
      {
        id: String(index),
        index,
        register: false,
        plugins: [],
        transition: null,
      },
      undefined
    );
    sortable.element = element as unknown as Element;
    sortable.droppable.shape = element.rectangle;
    sortable.droppable.refreshShape = mock(() => {
      sortable.droppable.shape = element.rectangle;
      return element.rectangle;
    });
    return sortable;
  });
  const droppables = new Map<UniqueIdentifier, Droppable>(
    items.map((item) => [item.id, item.droppable])
  );
  const operation = {
    controller: new AbortController(),
    source: items[0].draggable,
    target: items[0].droppable as Droppable | null,
    sourceIdentifier: items[0].id,
    canceled: false,
    activatorEvent: null,
    status: {dragging: true, initialized: false},
    position: {current: {x: 50, y: 30}},
    shape: {current: new Rectangle(0, 0, 100, 60)},
  };
  let position = operation.position.current;
  const positions: {x: number; y: number}[] = [];
  Object.defineProperty(operation.position, 'current', {
    get: () => position,
    set: (next: typeof position) => {
      const {left, top, width, height} =
        operation.shape.current.boundingRectangle;
      operation.shape = {
        current: new Rectangle(
          left + next.x - position.x,
          top + next.y - position.y,
          width,
          height
        ),
      };
      position = next;
      positions.push(next);
    },
  });
  const calls: (UniqueIdentifier | null)[] = [];
  const manager = {
    dragOperation: operation,
    pendingTargetRenders: 0,
    onRenderIdle: undefined as (() => void) | undefined,
    renderer: {rendering: Promise.resolve()},
    registry: {
      droppables: {
        [Symbol.iterator]: () => droppables.values(),
        get: (id: UniqueIdentifier) => droppables.get(id),
      },
      plugins: {get: () => undefined},
    },
    monitor: {
      addEventListener(
        name: string,
        listener: (event: any, manager: DragDropManager) => unknown
      ) {
        if (!listeners.has(name)) listeners.set(name, new Set());
        listeners.get(name)!.add(listener);
        return () => listeners.get(name)!.delete(listener);
      },
      dispatch(name: string, event: any) {
        const work = Array.from(listeners.get(name) ?? []).map((listener) =>
          listener(event, manager as unknown as DragDropManager)
        );
        return Promise.all(work).then(() => {});
      },
    },
    collisionObserver: {
      disabled: false,
      disable: mock(() => {}),
      enable: mock(() => {}),
      forceUpdate: mock(() => {}),
      computeCollisions: mock(
        (entries: Droppable[], detector: Droppable['collisionDetector']) =>
          entries
            .map((droppable) =>
              detector({droppable, dragOperation: operation as any})
            )
            .filter((collision) => collision != null)
            .sort((a, b) => b.value - a.value)
      ),
    },
    actions: {
      setDropTarget: mock((id: UniqueIdentifier | null) => {
        if (operation.target?.id === id) return Promise.resolve(false);
        manager.pendingTargetRenders++;
        calls.push(id);
        operation.target = droppables.get(id!) ?? null;
        const event = preventable({operation: {...operation}});
        const work = manager.monitor.dispatch('dragover', event);
        return Promise.all([work, manager.renderer.rendering])
          .then(() => manager.renderer.rendering)
          .then(() => event.defaultPrevented)
          .finally(() => {
            manager.pendingTargetRenders--;
            if (!manager.pendingTargetRenders) {
              queueMicrotask(() => manager.onRenderIdle?.());
            }
          });
      }),
      move: mock(({by}: {by: {x: number; y: number}}) => {
        queueMicrotask(() => {
          operation.position.current = {
            x: operation.position.current.x + by.x,
            y: operation.position.current.y + by.y,
          };
          const {left, top, width, height} =
            operation.shape.current.boundingRectangle;
          operation.shape = {
            current: new Rectangle(left + by.x, top + by.y, width, height),
          };
        });
      }),
    },
  };
  for (const item of items)
    item.draggable.manager = manager as unknown as DragDropManager;

  // Model the action layer's relative-input ordering; its real implementation
  // is covered by abstract action tests and the browser keyboard/drop cases.
  let keyboardWork = Promise.resolve();
  return {
    manager: manager as unknown as DragDropManager,
    fixture: manager,
    items,
    parent,
    droppables,
    operation,
    calls,
    positions,
    view,
    collision() {
      const event = preventable({collisions: []});
      manager.monitor.dispatch('collision', event);
      return event;
    },
    key(by = {x: 0, y: 25}) {
      const event = preventable({
        by,
        nativeEvent: new KeyboardEventFixture(items[0].element!),
      });
      const controller = operation.controller;
      const finished = keyboardWork.then(() => {
        if (operation.controller === controller && !controller.signal.aborted)
          return manager.monitor.dispatch('dragmove', event);
      });
      keyboardWork = finished.catch(() => {});
      return Object.assign(event, {finished});
    },
  };
}
