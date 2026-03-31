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

describe('Drag event ordering', () => {
  it('should fire dragstart before dragover when element is both draggable and droppable', async () => {
    const manager = new DragDropManager();
    const events: string[] = [];

    // Listen for all drag events
    manager.monitor.addEventListener('beforedragstart', () => {
      events.push('beforedragstart');
    });
    manager.monitor.addEventListener('dragstart', () => {
      events.push('dragstart');
    });
    manager.monitor.addEventListener('dragover', () => {
      events.push('dragover');
    });

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

    // Clean up
    manager.actions.stop();
    await flush();
    dispose();
    draggable.destroy();
    droppable.destroy();
    manager.destroy();
  });
});
