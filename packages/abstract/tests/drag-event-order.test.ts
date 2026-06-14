import {describe, expect, it} from 'bun:test';
import {
  CollisionPriority,
  CollisionType,
  DragDropManager,
  Draggable,
  Droppable,
} from '@dnd-kit/abstract';
import {Rectangle} from '@dnd-kit/geometry';
import {effects} from '@dnd-kit/state';

/** Flush microtasks so async stop/reset logic completes */
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

function setupCollidingDraggable(
  manager: DragDropManager<Draggable, Droppable>
) {
  // Create draggable and droppable with the same id (as in the reported bug)
  const draggable = new Draggable({id: 'item', register: false}, manager);
  draggable.register();

  const droppable = new Droppable(
    {
      id: 'item',
      register: false,
      collisionDetector: ({droppable}) => ({
        id: droppable.id,
        value: 1,
        type: CollisionType.ShapeIntersection,
        priority: CollisionPriority.Normal,
      }),
    },
    manager
  );
  droppable.shape = new Rectangle(0, 0, 100, 100);
  droppable.register();

  // Mimic the Feedback plugin's behavior: it only sets the drag shape
  // when status is initialized AND not initializing (i.e., when Dragging).
  // See: packages/dom/src/core/plugins/feedback/Feedback.ts lines 136-143
  const dispose = effects(() => {
    const {status} = manager.dragOperation;

    if (status.initialized && !status.initializing) {
      manager.dragOperation.shape = new Rectangle(0, 0, 100, 100);
    }
  });

  return {dispose, draggable, droppable};
}

describe('Drag event ordering', () => {
  it('should fire dragstart before dragover when element is both draggable and droppable', async () => {
    const manager = new DragDropManager();
    const events: string[] = [];
    let dragStartTarget: string | number | null | undefined;
    let dragOverTarget: string | number | null | undefined;

    // Listen for all drag events
    manager.monitor.addEventListener('beforedragstart', () => {
      events.push('beforedragstart');
    });
    manager.monitor.addEventListener('dragstart', (event) => {
      events.push('dragstart');
      dragStartTarget = event.operation.target?.id;
    });
    manager.monitor.addEventListener('dragover', (event) => {
      events.push('dragover');
      dragOverTarget = event.operation.target?.id;
    });

    const {dispose, draggable, droppable} = setupCollidingDraggable(manager);

    // Start drag operation
    manager.actions.start({
      source: draggable,
      coordinates: {x: 50, y: 50},
    });

    // Wait for renderer.rendering promise to resolve
    await flush();

    // dragstart must come before dragover
    const dragStartIndex = events.indexOf('dragstart');
    const dragOverIndex = events.indexOf('dragover');

    expect(dragStartIndex).not.toBe(-1);
    expect(dragOverIndex).not.toBe(-1);
    expect(dragStartIndex).toBeLessThan(dragOverIndex);
    expect(dragStartTarget).toBe('item');
    expect(dragOverTarget).toBe('item');

    // Clean up
    manager.actions.stop();
    await flush();
    dispose();
    draggable.destroy();
    droppable.destroy();
    manager.destroy();
  });

  it('should not fire queued dragover when dragstart stops the operation', async () => {
    const manager = new DragDropManager();
    const events: string[] = [];
    let dragStartTarget: string | number | null | undefined;

    manager.monitor.addEventListener('dragstart', (event) => {
      events.push('dragstart');
      dragStartTarget = event.operation.target?.id;
      manager.actions.stop();
    });
    manager.monitor.addEventListener('dragover', () => {
      events.push('dragover');
    });

    const {dispose, draggable, droppable} = setupCollidingDraggable(manager);

    manager.actions.start({
      source: draggable,
      coordinates: {x: 50, y: 50},
    });

    await flush();

    expect(dragStartTarget).toBe('item');
    expect(events).toEqual(['dragstart']);

    await flush();
    dispose();
    draggable.destroy();
    droppable.destroy();
    manager.destroy();
  });

  it('should start without a target when there is no initial droppable', async () => {
    const manager = new DragDropManager();
    const events: string[] = [];
    let dragStartTarget: Droppable | null | undefined;

    manager.monitor.addEventListener('dragstart', (event) => {
      events.push('dragstart');
      dragStartTarget = event.operation.target;
    });
    manager.monitor.addEventListener('dragover', () => {
      events.push('dragover');
    });

    const draggable = new Draggable({id: 'item', register: false}, manager);
    draggable.register();

    manager.actions.start({
      source: draggable,
      coordinates: {x: 50, y: 50},
    });

    await flush();

    expect(events).toEqual(['dragstart']);
    expect(dragStartTarget).toBeNull();

    manager.actions.stop();
    await flush();
    draggable.destroy();
    manager.destroy();
  });

  it('should resolve queued setDropTarget after dragover dispatches', async () => {
    const events: string[] = [];
    const renderingSnapshots: string[] = [];
    const manager = new DragDropManager({
      renderer: {
        get rendering() {
          renderingSnapshots.push(events.join('|'));
          return Promise.resolve();
        },
      },
    });
    let targetPromise: Promise<boolean> | undefined;
    let targetPromiseResolved = false;

    const draggable = new Draggable({id: 'item', register: false}, manager);
    draggable.register();

    const droppable = new Droppable(
      {
        id: 'target',
        register: false,
        collisionDetector: () => null,
      },
      manager
    );
    droppable.register();

    const dispose = effects(() => {
      if (manager.dragOperation.status.dragging && !targetPromise) {
        targetPromise = manager.actions.setDropTarget(droppable.id);
        targetPromise.then(() => {
          targetPromiseResolved = true;
        });
      }
    });

    manager.monitor.addEventListener('dragstart', () => {
      events.push('dragstart');
    });
    manager.monitor.addEventListener('dragover', (event) => {
      events.push('dragover');
      expect(targetPromiseResolved).toBe(false);
      event.preventDefault();
    });

    manager.actions.start({
      source: draggable,
      coordinates: {x: 50, y: 50},
    });

    await flush();

    expect(targetPromise).toBeDefined();
    expect(events).toEqual(['dragstart', 'dragover']);
    expect(renderingSnapshots[1]).toBe('dragstart|dragover');
    expect(await targetPromise!).toBe(true);
    expect(targetPromiseResolved).toBe(true);

    manager.actions.stop();
    await flush();
    dispose();
    draggable.destroy();
    droppable.destroy();
    manager.destroy();
  });
});
