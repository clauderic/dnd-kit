import {describe, expect, it} from 'bun:test';
import {
  CollisionPriority,
  CollisionType,
  DragDropManager,
  Draggable,
} from '@dnd-kit/abstract';

import {Droppable} from '../src/core/entities/droppable/droppable.ts';

function createElement(contains: (node: Node | null) => boolean = () => false) {
  return {contains} as Element;
}

describe('Drop target state', () => {
  it('marks ancestor droppables as drop targets when a descendant is targeted', () => {
    const manager = new DragDropManager();
    const source = new Draggable(
      {id: 'source', register: false, type: 'item'},
      manager
    );
    const childElement = createElement();
    const parentElement = createElement((node) => node === childElement);
    const siblingElement = createElement();
    const parent = new Droppable(
      {
        id: 'parent',
        accept: 'item',
        element: parentElement,
        register: false,
      },
      manager
    );
    const child = new Droppable(
      {id: 'child', accept: 'item', element: childElement, register: false},
      manager
    );
    const sibling = new Droppable(
      {id: 'sibling', element: siblingElement, register: false},
      manager
    );
    const rejectedParent = new Droppable(
      {
        id: 'rejected-parent',
        accept: 'other',
        element: parentElement,
        register: false,
      },
      manager
    );
    const disabledParent = new Droppable(
      {
        id: 'disabled-parent',
        disabled: true,
        element: parentElement,
        register: false,
      },
      manager
    );

    source.register();
    parent.register();
    child.register();
    sibling.register();
    rejectedParent.register();
    disabledParent.register();

    manager.dragOperation.sourceIdentifier = 'source';
    manager.dragOperation.targetIdentifier = 'child';
    Object.defineProperty(manager.collisionObserver, 'collisions', {
      configurable: true,
      value: [
        {
          id: 'sibling',
          priority: CollisionPriority.Normal,
          type: CollisionType.PointerIntersection,
          value: 1,
        },
      ],
    });

    expect(child.isDropTarget).toBe(true);
    expect(parent.isDropTarget).toBe(true);
    expect(sibling.isDropTarget).toBe(false);
    expect(rejectedParent.isDropTarget).toBe(false);
    expect(disabledParent.isDropTarget).toBe(false);

    manager.dragOperation.targetIdentifier = null;

    expect(child.isDropTarget).toBe(false);
    expect(parent.isDropTarget).toBe(false);

    source.destroy();
    parent.destroy();
    child.destroy();
    sibling.destroy();
    rejectedParent.destroy();
    disabledParent.destroy();
    manager.destroy();
  });
});
