import {describe, expect, it} from 'bun:test';
import {batch} from '@dnd-kit/state';
import {
  DragDropManager,
  Draggable,
  Plugin,
  CorePlugin,
  configure,
} from '@dnd-kit/abstract';

interface TestOptions {
  value?: string;
}

class PluginA extends Plugin {
  constructor(manager: DragDropManager, public options?: TestOptions) {
    super(manager, options);
  }
}

class PluginB extends Plugin {
  constructor(manager: DragDropManager, public options?: TestOptions) {
    super(manager, options);
  }
}

class PluginC extends CorePlugin {
  constructor(manager: DragDropManager, public options?: TestOptions) {
    super(manager, options);
  }
}

function indexOf(manager: DragDropManager, PluginClass: any): number {
  return manager.registry.plugins.values.findIndex(
    (p) => p.constructor === PluginClass
  );
}

describe('PluginRegistry duplicate handling', () => {
  it('should keep the first occurrence when duplicates exist', () => {
    const manager = new DragDropManager({
      plugins: [PluginA, PluginB, PluginA],
    });

    const pluginA = manager.registry.plugins.get(PluginA);
    const pluginB = manager.registry.plugins.get(PluginB);

    expect(pluginA).toBeInstanceOf(PluginA);
    expect(pluginB).toBeInstanceOf(PluginB);
    expect(indexOf(manager, PluginA)).toBeLessThan(indexOf(manager, PluginB));

    manager.destroy();
  });

  it('should apply options from the last occurrence to the first position', () => {
    const manager = new DragDropManager({
      plugins: [PluginA, PluginB, configure(PluginA, {value: 'custom'})],
    });

    const pluginA = manager.registry.plugins.get(PluginA);

    expect(pluginA).toBeDefined();
    expect(pluginA!.options).toEqual({value: 'custom'});
    expect(indexOf(manager, PluginA)).toBeLessThan(indexOf(manager, PluginB));

    manager.destroy();
  });

  it('should preserve registration order so earlier plugins are available to later ones', () => {
    let resolvedDep: Plugin | undefined;

    class DepPlugin extends Plugin {
      constructor(manager: DragDropManager) {
        super(manager);
      }
    }

    class ConsumerPlugin extends Plugin {
      constructor(manager: DragDropManager) {
        super(manager);
        resolvedDep = manager.registry.plugins.get(DepPlugin);
      }
    }

    const manager = new DragDropManager({
      plugins: [DepPlugin, ConsumerPlugin, configure(DepPlugin, {value: 'x'})],
    });

    expect(resolvedDep).toBeInstanceOf(DepPlugin);

    manager.destroy();
  });

  it('should handle configure with empty options', () => {
    const manager = new DragDropManager({
      plugins: [PluginA, PluginB, configure(PluginA, {})],
    });

    const pluginA = manager.registry.plugins.get(PluginA);

    expect(pluginA).toBeDefined();
    expect(pluginA!.options).toEqual({});
    expect(indexOf(manager, PluginA)).toBeLessThan(indexOf(manager, PluginB));

    manager.destroy();
  });

  it('should not create duplicate instances when the same plugin appears multiple times', () => {
    let instanceCount = 0;

    class TrackedPlugin extends Plugin {
      constructor(manager: DragDropManager) {
        super(manager);
        instanceCount++;
      }
    }

    const manager = new DragDropManager({
      plugins: [TrackedPlugin, PluginB, configure(TrackedPlugin, {value: 'x'})],
    });

    expect(instanceCount).toBe(1);

    manager.destroy();
  });

  it('should apply the rightmost options when a plugin appears more than twice', () => {
    const manager = new DragDropManager({
      plugins: [
        configure(PluginA, {value: 'first'}),
        PluginB,
        configure(PluginA, {value: 'second'}),
        configure(PluginA, {value: 'third'}),
      ],
    });

    const pluginA = manager.registry.plugins.get(PluginA);

    expect(pluginA!.options).toEqual({value: 'third'});
    expect(indexOf(manager, PluginA)).toBeLessThan(indexOf(manager, PluginB));

    manager.destroy();
  });
});

describe('Per-entity plugin auto-registration', () => {
  it('should auto-register plugins from entity plugins array', () => {
    const manager = new DragDropManager({});
    const draggable = new Draggable(
      {id: 'd1', plugins: [PluginA], register: false},
      manager
    );
    draggable.register();

    expect(manager.registry.plugins.get(PluginA)).toBeInstanceOf(PluginA);

    draggable.destroy();
    manager.destroy();
  });

  it('should auto-register configured plugins without applying entity options globally', () => {
    const manager = new DragDropManager({});
    const draggable = new Draggable(
      {
        id: 'd1',
        plugins: [configure(PluginA, {value: 'entity-only'})],
        register: false,
      },
      manager
    );
    draggable.register();

    const globalInstance = manager.registry.plugins.get(PluginA);
    expect(globalInstance).toBeInstanceOf(PluginA);
    expect(globalInstance!.options).toBeUndefined();

    draggable.destroy();
    manager.destroy();
  });

  it('should not duplicate-register already-registered plugins', () => {
    let instanceCount = 0;

    class TrackedPlugin extends Plugin {
      constructor(manager: DragDropManager) {
        super(manager);
        instanceCount++;
      }
    }

    const manager = new DragDropManager({plugins: [TrackedPlugin]});
    expect(instanceCount).toBe(1);

    const draggable = new Draggable(
      {id: 'd1', plugins: [TrackedPlugin], register: false},
      manager
    );
    draggable.register();

    expect(instanceCount).toBe(1);

    draggable.destroy();
    manager.destroy();
  });

  it('should keep auto-registered plugin alive after source entity is destroyed mid-drag', async () => {
    const manager = new DragDropManager({});
    const draggable = new Draggable(
      {id: 'd1', plugins: [PluginA], register: false},
      manager
    );
    draggable.register();

    manager.actions.start({source: draggable, coordinates: {x: 0, y: 0}});

    expect(manager.registry.plugins.get(PluginA)).toBeInstanceOf(PluginA);

    draggable.destroy();

    expect(manager.registry.plugins.get(PluginA)).toBeInstanceOf(PluginA);

    manager.actions.stop();
    await new Promise((resolve) => setTimeout(resolve, 10));
    manager.destroy();
  });
});

describe('Per-entity plugin config (pluginConfig)', () => {
  it('should return per-entity options for a configured plugin', () => {
    const manager = new DragDropManager({});
    const draggable = new Draggable(
      {
        id: 'd1',
        plugins: [configure(PluginA, {value: 'custom'})],
        register: false,
      },
      manager
    );

    expect(draggable.pluginConfig(PluginA)).toEqual({value: 'custom'});

    draggable.destroy();
    manager.destroy();
  });

  it('should return undefined for unconfigured plugins', () => {
    const manager = new DragDropManager({});
    const draggable = new Draggable({id: 'd1', register: false}, manager);

    expect(draggable.pluginConfig(PluginA)).toBeUndefined();

    draggable.destroy();
    manager.destroy();
  });

  it('should return undefined when entity has no plugins even if plugin is registered globally', () => {
    const manager = new DragDropManager({plugins: [PluginA]});
    const draggable = new Draggable({id: 'd1', register: false}, manager);

    expect(manager.registry.plugins.get(PluginA)).toBeInstanceOf(PluginA);
    expect(draggable.pluginConfig(PluginA)).toBeUndefined();

    draggable.destroy();
    manager.destroy();
  });

  it('should isolate per-entity config between different entities', () => {
    const manager = new DragDropManager({});
    const draggableA = new Draggable(
      {
        id: 'a',
        plugins: [configure(PluginA, {value: 'alpha'})],
        register: false,
      },
      manager
    );
    const draggableB = new Draggable(
      {
        id: 'b',
        plugins: [configure(PluginA, {value: 'beta'})],
        register: false,
      },
      manager
    );
    draggableA.register();
    draggableB.register();

    expect(draggableA.pluginConfig(PluginA)).toEqual({value: 'alpha'});
    expect(draggableB.pluginConfig(PluginA)).toEqual({value: 'beta'});

    const globalInstance = manager.registry.plugins.get(PluginA);
    expect(globalInstance!.options).toBeUndefined();

    draggableA.destroy();
    draggableB.destroy();
    manager.destroy();
  });

  it('should return per-entity options even when plugin is globally configured with different options', () => {
    const manager = new DragDropManager({
      plugins: [configure(PluginA, {value: 'global'})],
    });
    const draggable = new Draggable(
      {
        id: 'd1',
        plugins: [configure(PluginA, {value: 'entity'})],
        register: false,
      },
      manager
    );

    expect(draggable.pluginConfig(PluginA)).toEqual({value: 'entity'});
    expect(manager.registry.plugins.get(PluginA)!.options).toEqual({
      value: 'global',
    });

    draggable.destroy();
    manager.destroy();
  });

  it('should reflect updated options when plugins property is reassigned', () => {
    const manager = new DragDropManager({});
    const draggable = new Draggable(
      {
        id: 'd1',
        plugins: [configure(PluginA, {value: 'first'})],
        register: false,
      },
      manager
    );

    expect(draggable.pluginConfig(PluginA)).toEqual({value: 'first'});

    draggable.plugins = [configure(PluginA, {value: 'second'})];

    expect(draggable.pluginConfig(PluginA)).toEqual({value: 'second'});

    draggable.destroy();
    manager.destroy();
  });
});
