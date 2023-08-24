import {
  Draggable as AbstractDraggable,
  Sensor,
  descriptor,
} from '@dnd-kit/abstract';
import type {
  Data,
  DraggableInput,
  DragDropManager as AbstractDragDropManager,
} from '@dnd-kit/abstract';
import {effect, reactive} from '@dnd-kit/state';

import type {Sensors} from '../../sensors/index.js';

export type FeedbackType = 'default' | 'move' | 'clone' | 'none';

export interface Input<T extends Data = Data>
  extends DraggableInput<T, Draggable<T>> {
  handle?: Element;
  element?: Element;
  feedback?: FeedbackType;
  sensors?: Sensors;
}

export class Draggable<T extends Data = Data> extends AbstractDraggable<T> {
  @reactive
  public handle: Element | undefined;

  @reactive
  public element: Element | undefined;

  @reactive
  public feedback: FeedbackType;

  @reactive
  public sensors: Sensors | undefined;

  constructor(
    input: Input<T>,
    public manager: AbstractDragDropManager<any, any>
  ) {
    const {feedback = 'default'} = input;
    const config = {...input, feedback};

    super(config, manager);

    this.feedback = feedback;

    const effectCleanup = effect(() => {
      const sensors = this.sensors?.map(descriptor) ?? [...manager.sensors];
      const unbindFunctions = sensors.map((entry) => {
        const sensorInstance =
          entry instanceof Sensor
            ? entry
            : manager.registry.register(entry.plugin);
        const options = entry instanceof Sensor ? undefined : entry.options;

        const unbind = sensorInstance.bind(this, options);
        return unbind;
      });

      return function cleanup() {
        unbindFunctions.forEach((unbind) => unbind());
      };
    });

    const {destroy} = this;

    this.destroy = () => {
      effectCleanup();
      destroy();
    };
  }
}
