import {derived, reactive} from '@dnd-kit/state';

import {Entity} from '../entity/index.ts';
import type {EntityInput, Data, Type} from '../entity/index.ts';
import type {Modifiers} from '../../modifiers/index.ts';
import type {DragDropManager} from '../../manager/index.ts';
import type {Sensors} from '../../sensors/sensor.ts';

export interface Input<T extends Data = Data> extends EntityInput<T> {
  type?: Type;
  modifiers?: Modifiers;
  sensors?: Sensors;
}

export type DraggableStatus = 'idle' | 'dragging' | 'dropping';

export class Draggable<
  T extends Data = Data,
  U extends DragDropManager<any, any> = DragDropManager<any, any>,
> extends Entity<T> {
  constructor(
    {modifiers, type, sensors, ...input}: Input<T>,
    manager: U | undefined
  ) {
    super(input, manager);

    this.type = type;
    this.sensors = sensors;
    this.modifiers = modifiers;
  }

  public sensors: Sensors | undefined;

  @reactive
  public accessor modifiers: Modifiers | undefined;

  @reactive
  public accessor type: Type | undefined;

  @reactive
  public accessor status: DraggableStatus = 'idle';

  /**
   * A boolean indicating whether the draggable item is the source of a drag operation.
   */
  @derived
  public get isDragSource() {
    return this.manager?.dragOperation.source?.id === this.id;
  }
}
