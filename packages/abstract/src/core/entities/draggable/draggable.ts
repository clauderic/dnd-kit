import {derived, reactive} from '@dnd-kit/state';
import type {Alignment} from '@dnd-kit/geometry';

import {Entity} from '../entity/index.ts';
import type {EntityInput, Data, Type} from '../entity/index.ts';
import type {Modifiers} from '../../modifiers/index.ts';
import type {DragDropManager} from '../../manager/index.ts';
import type {Sensors} from '../../sensors/sensor.ts';
import type {
  Plugins,
  PluginConstructor,
  PluginDescriptor,
} from '../../plugins/index.ts';
import {descriptor as toDescriptor} from '../../plugins/index.ts';

/**
 * Input configuration for creating a draggable entity.
 *
 * @template T - The type of data associated with the draggable
 *
 * @remarks
 * Extends the base entity input with draggable-specific configuration:
 * - Type for categorization
 * - Sensors for handling drag interactions
 * - Modifiers for transforming drag behavior
 * - Alignment for positioning
 */
export interface Input<T extends Data = Data> extends EntityInput<T> {
  type?: Type;
  sensors?: Sensors;
  modifiers?: Modifiers;
  alignment?: Alignment;
  plugins?: Plugins;
}

/**
 * Possible status values for a draggable entity.
 *
 * @remarks
 * - idle: Not being dragged
 * - dragging: Currently being dragged
 * - dropping: Currently being dropped
 */
export type DraggableStatus = 'idle' | 'dragging' | 'dropping';

/**
 * Represents an entity that can be dragged in a drag and drop operation.
 *
 * @template T - The type of data associated with the draggable
 * @template U - The type of drag and drop manager
 *
 * @remarks
 * This class extends the base Entity class with draggable-specific functionality:
 * - Type-based categorization
 * - Sensor-based interaction handling
 * - Modifier-based behavior transformation
 * - Status tracking during drag operations
 */
export class Draggable<
  T extends Data = Data,
  U extends DragDropManager<any, any> = DragDropManager<any, any>,
> extends Entity<T, U> {
  constructor(
    {modifiers, type, sensors, plugins, effects, ...input}: Input<T>,
    manager: U | undefined
  ) {
    super(
      {
        ...input,
        effects: () => [
          ...(effects?.() ?? []),
          () => {
            const {manager, plugins} = this;
            if (!manager || !plugins) return;

            for (const entry of plugins) {
              const {plugin} = toDescriptor(entry);
              manager.registry.plugins.register(plugin);
            }
          },
        ],
      },
      manager
    );

    this.type = type;
    this.sensors = sensors;
    this.modifiers = modifiers;
    this.alignment = input.alignment;
    this.plugins = plugins;
  }

  /** The type of the draggable entity */
  @reactive
  public accessor type: Type | undefined;

  /** The sensors associated with the draggable entity */
  public sensors: Sensors | undefined;

  /** The modifiers associated with the draggable entity */
  @reactive
  public accessor modifiers: Modifiers | undefined;

  /** The alignment of the draggable entity */
  public alignment: Alignment | undefined;

  /** Per-entity plugin configuration descriptors */
  public plugins: Plugins | undefined;

  /**
   * Look up per-entity options for a given plugin constructor.
   */
  public pluginConfig<P extends PluginConstructor>(
    plugin: P
  ): PluginDescriptor<any, any, P>['options'] | undefined {
    if (!this.plugins) return undefined;

    for (const entry of this.plugins) {
      const desc = toDescriptor(entry);
      if (desc.plugin === plugin) return desc.options;
    }

    return undefined;
  }

  /** The current status of the draggable entity */
  @reactive
  public accessor status: DraggableStatus = this.isDragSource
    ? 'dragging'
    : 'idle';

  /**
   * Checks if the draggable entity is currently being dropped.
   *
   * @returns true if the entity is being dropped and is the drag source
   */
  @derived
  public get isDropping() {
    return this.status === 'dropping' && this.isDragSource;
  }

  /**
   * Checks if the draggable entity is currently being dragged.
   *
   * @returns true if the entity is being dragged and is the drag source
   */
  @derived
  public get isDragging() {
    return this.status === 'dragging' && this.isDragSource;
  }

  /**
   * Checks if the draggable entity is the source of the current drag operation.
   *
   * @returns true if the entity's ID matches the current drag operation's source ID
   */
  @derived
  public get isDragSource() {
    return this.manager?.dragOperation.source?.id === this.id;
  }
}
