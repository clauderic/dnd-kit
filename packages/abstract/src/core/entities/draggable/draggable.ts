import {derived, reactive} from '@dnd-kit/state';

import {Entity} from '../entity/index.ts';
import type {EntityInput, Data, Type} from '../entity/index.ts';
import {Modifier} from '../../modifiers/index.ts';
import type {Modifiers} from '../../modifiers/index.ts';
import type {DragDropManager} from '../../manager/index.ts';
import {descriptor} from '../../plugins/index.ts';
import type {Sensors} from '../../sensors/sensor.ts';

export interface Input<
  T extends Data = Data,
  U extends Draggable<T> = Draggable<T>,
> extends EntityInput<T, U> {
  type?: Type;
  modifiers?: Modifiers;
  sensors?: Sensors;
}

export class Draggable<T extends Data = Data> extends Entity<T> {
  constructor(
    {modifiers, type, sensors, ...input}: Input<T>,
    public manager: DragDropManager
  ) {
    super(input, manager);

    this.type = type;
    this.sensors = sensors;

    if (modifiers?.length) {
      this.modifiers = modifiers.map((modifier) => {
        const {plugin, options} = descriptor(modifier);

        return new plugin(manager, options);
      });
    }
  }

  public sensors: Sensors | undefined;

  public modifiers: Modifier[] | undefined;

  @reactive
  public type: Type | undefined;

  /**
   * A boolean indicating whether the draggable item is the source of a drag operation.
   */
  @derived
  public get isDragSource() {
    const {dragOperation} = this.manager;

    return dragOperation.source?.id === this.id;
  }
}
