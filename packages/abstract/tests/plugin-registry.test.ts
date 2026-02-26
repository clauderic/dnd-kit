import {describe, expect, it} from 'bun:test';
import {
  DragDropManager,
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
