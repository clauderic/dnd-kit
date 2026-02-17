import {describe, expect, it} from 'bun:test';
import {batch} from '@dnd-kit/state';
import {
  DragDropManager,
  Modifier,
  Draggable,
  configure,
} from '@dnd-kit/abstract';

class ClampXModifier extends Modifier {
  public apply(operation: Parameters<Modifier['apply']>[0]) {
    return {x: 0, y: operation.transform.y};
  }
}

class ClampYModifier extends Modifier {
  public apply(operation: Parameters<Modifier['apply']>[0]) {
    return {x: operation.transform.x, y: 0};
  }
}

/** Flush microtasks so async stop/reset logic completes */
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

describe('Manager-level modifiers', () => {
  it('should apply manager modifiers when draggable has none', () => {
    const manager = new DragDropManager({modifiers: [ClampXModifier]});
    const draggable = new Draggable({id: 'd1', register: false}, manager);
    draggable.register();

    manager.actions.start({source: draggable, coordinates: {x: 0, y: 0}});
    batch(() => {
      manager.dragOperation.position.current = {x: 100, y: 50};
    });

    expect(manager.dragOperation.transform).toEqual({x: 0, y: 50});

    draggable.destroy();
    manager.destroy();
  });

  it('should apply configured manager modifiers', () => {
    const manager = new DragDropManager({
      modifiers: [configure(ClampXModifier, undefined)],
    });
    const draggable = new Draggable({id: 'd1', register: false}, manager);
    draggable.register();

    manager.actions.start({source: draggable, coordinates: {x: 0, y: 0}});
    batch(() => {
      manager.dragOperation.position.current = {x: 100, y: 50};
    });

    expect(manager.dragOperation.transform).toEqual({x: 0, y: 50});

    draggable.destroy();
    manager.destroy();
  });

  it('should prefer draggable modifiers over manager modifiers', () => {
    const manager = new DragDropManager({modifiers: [ClampXModifier]});
    const draggable = new Draggable(
      {id: 'd1', modifiers: [ClampYModifier], register: false},
      manager
    );
    draggable.register();

    manager.actions.start({source: draggable, coordinates: {x: 0, y: 0}});
    batch(() => {
      manager.dragOperation.position.current = {x: 100, y: 50};
    });

    expect(manager.dragOperation.transform).toEqual({x: 100, y: 0});

    draggable.destroy();
    manager.destroy();
  });
});

describe('Manager modifier lifecycle', () => {
  it('should not destroy manager modifiers when drag starts', () => {
    let destroyCount = 0;

    class TrackedModifier extends ClampXModifier {
      public destroy() {
        destroyCount++;
        super.destroy();
      }
    }

    const manager = new DragDropManager({modifiers: [TrackedModifier]});
    const draggable = new Draggable({id: 'd1', register: false}, manager);
    draggable.register();

    manager.actions.start({source: draggable, coordinates: {x: 0, y: 0}});

    expect(destroyCount).toBe(0);

    draggable.destroy();
    manager.destroy();
  });

  it('should not destroy manager modifiers when drag stops', async () => {
    let destroyCount = 0;

    class TrackedModifier extends ClampXModifier {
      public destroy() {
        destroyCount++;
        super.destroy();
      }
    }

    const manager = new DragDropManager({modifiers: [TrackedModifier]});
    const draggable = new Draggable({id: 'd1', register: false}, manager);
    draggable.register();

    manager.actions.start({source: draggable, coordinates: {x: 0, y: 0}});
    manager.actions.stop();
    await flush();

    expect(destroyCount).toBe(0);

    draggable.destroy();
    manager.destroy();
  });

  it('should keep manager modifiers working across multiple drags', async () => {
    const manager = new DragDropManager({modifiers: [ClampXModifier]});
    const draggable = new Draggable({id: 'd1', register: false}, manager);
    draggable.register();

    // First drag
    manager.actions.start({source: draggable, coordinates: {x: 0, y: 0}});
    batch(() => {
      manager.dragOperation.position.current = {x: 100, y: 50};
    });
    expect(manager.dragOperation.transform).toEqual({x: 0, y: 50});

    manager.actions.stop();
    await flush();

    // Second drag — manager modifiers must still be active
    manager.actions.start({source: draggable, coordinates: {x: 0, y: 0}});
    batch(() => {
      manager.dragOperation.position.current = {x: 200, y: 75};
    });
    expect(manager.dragOperation.transform).toEqual({x: 0, y: 75});

    draggable.destroy();
    manager.destroy();
  });

  it('should destroy per-operation modifiers when draggable modifiers change mid-drag', () => {
    let destroyCount = 0;

    class TrackedModifier extends ClampXModifier {
      public destroy() {
        destroyCount++;
        super.destroy();
      }
    }

    const manager = new DragDropManager({});
    const draggable = new Draggable(
      {id: 'd1', modifiers: [TrackedModifier], register: false},
      manager
    );
    draggable.register();

    manager.actions.start({source: draggable, coordinates: {x: 0, y: 0}});
    expect(destroyCount).toBe(0);

    // Changing the draggable's modifiers mid-drag triggers the effect,
    // which should destroy the old per-operation instances
    draggable.modifiers = [ClampYModifier];

    expect(destroyCount).toBe(1);

    draggable.destroy();
    manager.destroy();
  });

  it('should destroy per-operation modifiers when switching to manager modifiers mid-drag', () => {
    let destroyCount = 0;

    class TrackedModifier extends ClampXModifier {
      public destroy() {
        destroyCount++;
        super.destroy();
      }
    }

    const manager = new DragDropManager({modifiers: [ClampYModifier]});
    const draggable = new Draggable(
      {id: 'd1', modifiers: [TrackedModifier], register: false},
      manager
    );
    draggable.register();

    manager.actions.start({source: draggable, coordinates: {x: 0, y: 0}});
    expect(destroyCount).toBe(0);

    // Removing draggable modifiers should fall back to manager modifiers
    // and destroy the per-operation instances
    draggable.modifiers = undefined;

    expect(destroyCount).toBe(1);

    // Manager modifiers should now be active
    batch(() => {
      manager.dragOperation.position.current = {x: 100, y: 50};
    });
    expect(manager.dragOperation.transform).toEqual({x: 100, y: 0});

    draggable.destroy();
    manager.destroy();
  });

  it('should not destroy manager modifiers when different draggables are used', async () => {
    let destroyCount = 0;

    class TrackedModifier extends ClampXModifier {
      public destroy() {
        destroyCount++;
        super.destroy();
      }
    }

    const manager = new DragDropManager({modifiers: [TrackedModifier]});
    const draggableA = new Draggable({id: 'a', register: false}, manager);
    const draggableB = new Draggable({id: 'b', register: false}, manager);
    draggableA.register();
    draggableB.register();

    // First drag with draggable A
    manager.actions.start({source: draggableA, coordinates: {x: 0, y: 0}});
    manager.actions.stop();
    await flush();

    expect(destroyCount).toBe(0);

    // Second drag with draggable B
    manager.actions.start({source: draggableB, coordinates: {x: 0, y: 0}});
    batch(() => {
      manager.dragOperation.position.current = {x: 100, y: 50};
    });
    expect(manager.dragOperation.transform).toEqual({x: 0, y: 50});
    expect(destroyCount).toBe(0);

    draggableA.destroy();
    draggableB.destroy();
    manager.destroy();
  });
});
