import {expect, it} from 'bun:test';
import {
  CollisionPriority,
  CollisionType,
  DragDropManager,
  Draggable,
  Droppable,
} from '@dnd-kit/abstract';
import {Rectangle} from '@dnd-kit/geometry';
import {effects} from '@dnd-kit/state';

it.each([
  {name: 'another target', x: 150, target: 'B'},
  {name: 'no target', x: 250, target: undefined},
])(
  'applies a collision change to $name during rendering',
  async ({x, target}) => {
    const render = Promise.withResolvers<void>();
    let rendering = Promise.resolve();
    const manager = new DragDropManager({
      renderer: {
        get rendering() {
          return rendering;
        },
      },
    });
    const source = new Draggable({id: 'source', register: false}, manager);
    source.register();
    const targets = ['A', 'B'].map(
      (id, index) =>
        new Droppable(
          {
            id,
            register: false,
            collisionDetector: ({dragOperation}) => {
              const x = dragOperation.position.current.x;
              if (Math.floor(x / 100) !== index) {
                return null;
              }
              return {
                id,
                value: 1,
                type: CollisionType.ShapeIntersection,
                priority: CollisionPriority.Normal,
              };
            },
          },
          manager
        )
    );
    targets.forEach((droppable) => droppable.register());
    const dispose = effects(() => {
      const {position, status} = manager.dragOperation;
      if (status.dragging) {
        manager.dragOperation.shape = new Rectangle(
          position.current.x,
          0,
          10,
          10
        );
      }
    });
    const stopListening = manager.monitor.addEventListener(
      'dragover',
      (event) => {
        if (event.operation.target?.id === 'A') {
          rendering = render.promise;
        }
      }
    );

    try {
      manager.actions.start({source, coordinates: {x: -50, y: 0}});
      await Bun.sleep(0);

      manager.actions.move({to: {x: 50, y: 0}});
      await Bun.sleep(0);
      expect(manager.dragOperation.target?.id).toBe('A');
      expect(manager.collisionObserver.isDisabled()).toBe(true);

      manager.actions.move({to: {x, y: 0}});
      await Bun.sleep(0);
      expect(manager.collisionObserver.collisions[0]?.id).toBe(target);
      expect(manager.dragOperation.target?.id).toBe('A');

      rendering = Promise.resolve();
      render.resolve();
      await Bun.sleep(0);
      expect(manager.collisionObserver.isDisabled()).toBe(false);
      expect(manager.dragOperation.target?.id).toBe(target);
    } finally {
      render.resolve();
      stopListening();
      dispose();
      source.destroy();
      targets.forEach((droppable) => droppable.destroy());
      manager.destroy();
    }
  }
);
