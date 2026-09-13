import {afterEach, describe, expect, it, mock} from 'bun:test';
import {
  DragDropManager,
  Draggable as AbstractDraggable,
  Droppable as AbstractDroppable,
} from '@dnd-kit/abstract';
import type {CollisionDetector} from '@dnd-kit/abstract';
import {closestCorners, pointerIntersection} from '@dnd-kit/collision';
import {Sortable} from '@dnd-kit/dom/sortable';
import {ProxiedElements} from '@dnd-kit/dom/utilities';
import {Rectangle} from '@dnd-kit/geometry';
import {batch} from '@dnd-kit/state';

import {StatusValue} from '../../abstract/src/core/manager/status.ts';
import {Draggable} from '../src/core/entities/draggable/draggable.ts';
import {Droppable} from '../src/core/entities/droppable/droppable.ts';

// Only DOM ancestry is modeled: no layout, observers, globals or timers.
// Production entities, proxy storage, collision observation and detectors are
// real. Import the edited Droppable source so this suite needs no DOM rebuild.
class ShadowRootFixture {
  nodeType = 11;
  parentNode = null;

  constructor(public host: Element) {}

  get ownerDocument() {
    return this.host.ownerDocument;
  }
}

function createDocument(frame?: Element): Document {
  const view = {
    ShadowRoot: ShadowRootFixture,
    frameElement: frame ?? null,
  };

  Object.assign(view, {
    self: view,
    parent: frame?.ownerDocument.defaultView ?? view,
  });

  return {
    nodeType: 9,
    parentNode: null,
    ownerDocument: null,
    defaultView: view,
  } as unknown as Document;
}

function createElement(parent: Node | null = createDocument()): Element {
  return {
    nodeType: 1,
    parentNode: parent,
    ownerDocument:
      parent?.nodeType === 9
        ? parent
        : (parent?.ownerDocument ?? createDocument()),
    contains(other: Node | null) {
      for (let node = other; node; node = node.parentNode) {
        if (node === this) return true;
      }
      return false;
    },
    getRootNode() {
      let node: Node = this;
      while (node.parentNode) node = node.parentNode;
      return node;
    },
  } as Element;
}

function reparent(element: Element, parent: Node | null) {
  Object.assign(element, {parentNode: parent});
}

function createSource(element?: Element) {
  return new Draggable({id: 'source', element, type: 'container'}, undefined);
}

function createTarget(element?: Element, id: string | number = 'target') {
  return new Droppable({id, element}, undefined);
}

const cleanups: (() => void)[] = [];

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup();
});

function proxy(target: Pick<Droppable, 'element' | 'proxy'>, element: Element) {
  const original = target.element!;
  target.proxy = element;
  ProxiedElements.set(original, element);
  cleanups.push(() => {
    target.proxy = undefined;
    ProxiedElements.delete(original);
  });
}

describe('DOM droppable structural eligibility', () => {
  it('excludes children and grandchildren, preserving the source, ancestors and peers', () => {
    const ancestor = createElement();
    const root = createElement(ancestor);
    const child = createElement(root);
    const grandchild = createElement(child);
    const sibling = createElement(ancestor);
    const source = createSource(root);

    expect(createTarget(child).accepts(source)).toBe(false);
    expect(createTarget(grandchild).accepts(source)).toBe(false);
    expect(createTarget(root).accepts(source)).toBe(true);
    expect(createTarget(ancestor).accepts(source)).toBe(true);
    expect(createTarget(sibling).accepts(source)).toBe(true);
    expect(createTarget(createElement()).accepts(source)).toBe(true);
  });

  it('retains type, array and callback accept policies, including self-targets', () => {
    const root = createElement();
    const source = createSource(root);
    const external = createTarget(createElement());
    const child = createTarget(createElement(root));
    const self = createTarget(root, source.id);

    for (const accept of ['container', ['card', 'container']] as const) {
      external.accept = typeof accept === 'string' ? accept : [...accept];
      child.accept = external.accept;
      expect(external.accepts(source)).toBe(true);
      expect(child.accepts(source)).toBe(false);
    }

    for (const accept of ['card', ['card'], () => false]) {
      external.accept = accept;
      self.accept = accept;
      expect(external.accepts(source)).toBe(false);
      expect(self.accepts(source)).toBe(false);
    }

    const accept = mock((draggable: AbstractDraggable) => draggable === source);
    child.accept = accept;
    expect(child.accepts(source)).toBe(false);
    expect(accept).toHaveBeenCalledTimes(1);
    expect(accept).toHaveBeenCalledWith(source);

    external.accept = 'container';
    source.type = undefined;
    expect(external.accepts(source)).toBe(false);
  });

  it('keeps element-less sources and targets compatible with the base API', () => {
    const target = createTarget(createElement());
    const abstractSource = new AbstractDraggable({id: 'abstract'}, undefined);

    expect(target.accepts(abstractSource)).toBe(true);
    expect(target.accepts(createSource())).toBe(true);
    expect(createTarget().accepts(createSource(createElement()))).toBe(true);
    target.accept = () => false;
    expect(target.accepts(abstractSource)).toBe(false);
  });

  it('preserves typed self identity without exempting a different descendant', () => {
    const root = createElement();
    const source = new Draggable({id: 1, element: root}, undefined);
    const child = createElement(root);

    expect(createTarget(child, 1).accepts(source)).toBe(true);
    expect(createTarget(child, '1').accepts(source)).toBe(false);
  });

  it('follows the moved source subtree immediately and allows real transfers out of it', () => {
    const root = createElement();
    const portal = createElement();
    const child = createElement(root);
    const source = createSource(root);
    const target = createTarget(child);

    reparent(root, portal);
    expect(target.accepts(source)).toBe(false);
    expect(createTarget(portal).accepts(source)).toBe(true);

    reparent(root, null);
    expect(target.accepts(source)).toBe(false);
    reparent(child, portal);
    expect(target.accepts(source)).toBe(true);
    reparent(child, root);
    expect(target.accepts(source)).toBe(false);
  });

  it('rejects a proxied child even when a plain draggable has no root placeholder mapping', () => {
    const root = createElement();
    const source = createSource(root);
    const child = createTarget(createElement(root));
    const placeholder = createElement();
    proxy(child, createElement(placeholder));

    expect(ProxiedElements.has(root)).toBe(false);
    expect(root.contains(child.element!)).toBe(false);
    expect(child.accepts(source)).toBe(false);
  });

  it('uses the placeholder subtree while original targets are replaced, then clears eligibility on cleanup', () => {
    const root = createElement();
    const source = createSource(root);
    const self = createTarget(root, 'source');
    const child = createTarget(createElement(root));
    const placeholder = createElement();
    proxy(self, placeholder);
    proxy(child, createElement(placeholder));

    reparent(root, createElement());
    child.element = createElement();
    expect(self.accepts(source)).toBe(true);
    expect(child.accepts(source)).toBe(false);

    child.proxy = undefined;
    expect(child.accepts(source)).toBe(true);
  });

  it('checks a newly assigned target in the source even while its old proxy is elsewhere', () => {
    const root = createElement();
    const source = createSource(root);
    const target = createTarget(createElement());
    proxy(target, createElement());
    target.element = createElement(root);

    expect(target.accepts(source)).toBe(false);
  });

  it('uses the sortable draggable source, preserving a separate self-target and its proxy', () => {
    const root = createElement();
    const sortable = new Sortable(
      {id: 'source', index: 0, element: root, plugins: [], transition: null},
      undefined
    );
    cleanups.push(() => sortable.destroy());
    const placeholder = createElement();
    proxy(sortable.droppable, placeholder);
    expect(sortable.element).toBe(placeholder);
    expect(sortable.source).toBe(root);

    // The source-imported class is the implementation under test; the existing
    // sortable bundle supplies a real SortableDraggable with its usual getters.
    const self = createTarget(createElement(root), 'source');
    proxy(self, createElement(placeholder));
    expect(self.accepts(sortable.draggable)).toBe(true);
    self.accept = () => false;
    expect(self.accepts(sortable.draggable)).toBe(false);
    expect(createTarget(createElement(root)).accepts(sortable.draggable)).toBe(
      false
    );
    expect(
      createTarget(createElement(placeholder)).accepts(sortable.draggable)
    ).toBe(false);

    // A separate source can be narrower than the sortable's layout element.
    sortable.source = createElement(root);
    expect(createTarget(createElement(root)).accepts(sortable.draggable)).toBe(
      true
    );
    expect(
      createTarget(createElement(sortable.source)).accepts(sortable.draggable)
    ).toBe(false);
  });

  it('crosses nested shadow hosts without treating an unrelated shadow tree as owned', () => {
    const root = createElement();
    const shadow = new ShadowRootFixture(root) as unknown as ShadowRoot;
    const nestedHost = createElement(shadow);
    const nestedShadow = new ShadowRootFixture(
      nestedHost
    ) as unknown as ShadowRoot;
    const child = createElement(nestedShadow);
    const source = createSource(root);

    expect(root.contains(child)).toBe(false);
    expect(createTarget(child).accepts(source)).toBe(false);
    expect(createTarget(nestedHost).accepts(source)).toBe(false);
    expect(createTarget(root).accepts(createSource(child))).toBe(true);
    expect(createTarget(child).accepts(createSource(createElement()))).toBe(
      true
    );
  });

  it('crosses nested accessible frames and shadow hosts, but not unrelated or detached frame nodes', () => {
    const root = createElement();
    const frame = createElement(root);
    const frameDocument = createDocument(frame);
    const nestedFrame = createElement(frameDocument);
    const nestedDocument = createDocument(nestedFrame);
    const host = createElement(nestedDocument);
    const shadow = new ShadowRootFixture(host) as unknown as ShadowRoot;
    const child = createElement(shadow);
    const source = createSource(root);

    expect(root.contains(child)).toBe(false);
    expect(createTarget(child).accepts(source)).toBe(false);
    expect(createTarget(host).accepts(createSource(frame))).toBe(false);
    expect(createTarget(root).accepts(createSource(child))).toBe(true);
    expect(createTarget(createElement(createDocument())).accepts(source)).toBe(
      true
    );

    reparent(host, null);
    expect(createTarget(child).accepts(source)).toBe(true);
    reparent(host, nestedDocument);
    Object.assign(frameDocument.defaultView!, {frameElement: null});
    expect(createTarget(child).accepts(source)).toBe(true);
  });
});

describe('DOM eligibility before collision ranking', () => {
  for (const path of ['observer', 'keyboard'] as const) {
    it(`filters descendants, disabled targets and rejected types in the ${path} path`, async () => {
      const manager = new DragDropManager<Draggable, Droppable>();
      manager.plugins = [];
      cleanups.push(() => {
        manager.dragOperation.reset();
        manager.destroy();
      });

      const root = createElement();
      const source = createSource(root);
      const self = createTarget(root, 'source');
      const child = createTarget(createElement(root), 'child');
      const peer = createTarget(createElement(), 'peer');
      const disabled = createTarget(createElement(), 'disabled');
      const rejected = createTarget(createElement(), 'rejected');
      disabled.disabled = true;
      rejected.accept = 'card';
      child.collisionPriority = 1000;
      const entries = [self, child, peer, disabled, rejected];
      const detector =
        path === 'keyboard' ? closestCorners : pointerIntersection;
      const visited: (string | number)[] = [];
      const detect: CollisionDetector = (input) => {
        visited.push(input.droppable.id);
        expect(Object.is(input.dragOperation, manager.dragOperation)).toBe(
          true
        );
        return detector(input);
      };

      // Keep DOM entities manager-less so fixed rectangles need no browser
      // measurement effects. The real abstract registry/observer handles them.
      manager.registry.register(source);
      for (const target of entries) {
        target.shape = new Rectangle(0, 0, 100, 100);
        target.collisionDetector = detect;
        manager.registry.register(target);
      }

      batch(() => {
        manager.dragOperation.sourceIdentifier = source.id;
        manager.dragOperation.position.current = {x: 25, y: 25};
        manager.dragOperation.shape = new Rectangle(20, 20, 10, 10);
        manager.dragOperation.status.set(StatusValue.Dragging);
      });

      const compute = () =>
        path === 'keyboard'
          ? manager.collisionObserver.computeCollisions(entries, detect)
          : manager.collisionObserver.computeCollisions();
      visited.length = 0;
      expect(compute().map(({id}) => id)).toEqual(['source', 'peer']);
      expect(visited).toEqual(['source', 'peer']);
      // Explicit computation is synchronous; automatic publication coalesces
      // the reactive changes above into a microtask.
      await Promise.resolve();
      expect(manager.collisionObserver.collisions.map(({id}) => id)).toEqual([
        'source',
        'peer',
      ]);

      const placeholder = createElement();
      proxy(self, placeholder);
      proxy(child, createElement(placeholder));
      reparent(root, createElement());
      visited.length = 0;
      expect(compute().map(({id}) => id)).toEqual(['source', 'peer']);
      expect(visited).toEqual(['source', 'peer']);
      await Promise.resolve();
      expect(manager.collisionObserver.collisions.map(({id}) => id)).toEqual([
        'source',
        'peer',
      ]);

      peer.disabled = true;
      self.accept = () => false;
      expect(compute()).toEqual([]);
      await Promise.resolve();
      expect(manager.collisionObserver.collisions).toEqual([]);
    });
  }

  it('leaves abstract droppables independent of DOM ancestry', () => {
    const root = createElement();
    const source = createSource(root);
    const abstractTarget = new AbstractDroppable(
      {id: 'abstract', collisionDetector: pointerIntersection},
      undefined
    );
    Object.assign(abstractTarget, {element: createElement(root)});

    expect(abstractTarget.accepts(source)).toBe(true);
    expect(createTarget(createElement(root)).accepts(source)).toBe(false);
  });
});
