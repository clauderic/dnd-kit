import {derived, reactive} from '@dnd-kit/state';
import type {Alignment} from '@dnd-kit/geometry';

import {Entity} from '../entity/index.ts';
import type {EntityInput, Data, Type} from '../entity/index.ts';
import type {Modifiers} from '../../modifiers/index.ts';
import type {DragDropManager} from '../../manager/index.ts';
import type {Sensors} from '../../sensors/sensor.ts';

export interface Input<T extends Data = Data> extends EntityInput<T> {
  type?: Type;
  sensors?: Sensors;
  modifiers?: Modifiers;
  alignment?: Alignment;
}

export type DraggableStatus = 'idle' | 'dragging' | 'dropping';

export class Draggable<
  T extends Data = Data,
  U extends DragDropManager<any, any> = DragDropManager<any, any>,
> extends Entity<T, U> {
  constructor(
    {modifiers, type, sensors, ...input}: Input<T>,
    manager: U | undefined
  ) {
    super(input, manager);

    this.type = type;
    this.sensors = sensors;
    this.modifiers = modifiers;
    this.alignment = input.alignment;
  }

  @reactive
  public accessor type: Type | undefined;

  public sensors: Sensors | undefined;

  @reactive
  public accessor modifiers: Modifiers | undefined;

  public alignment: Alignment | undefined;

  @reactive
  public accessor status: DraggableStatus = this.isDragSource
    ? 'dragging'
    : 'idle';

  /**
   * A boolean indicating whether the draggable item is being dropped.
   */
  @derived
  public get isDropping() {
    return this.status === 'dropping' && this.isDragSource;
  }

  /**
   * A boolean indicating whether the draggable item is being dropped.
   */
  @derived
  public get isDragging() {
    return this.status === 'dragging' && this.isDragSource;
  }

  /**
   * A boolean indicating whether the draggable item is the source of a drag operation.
   */
  @derived
  public get isDragSource() {
    return this.manager?.dragOperation.source?.id === this.id;
  }
}
