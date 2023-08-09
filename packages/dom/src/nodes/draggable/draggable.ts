import {
  Draggable as AbstractDraggable,
  Sensor,
  descriptor,
} from '@dnd-kit/abstract';
import type {
  Data,
  DraggableInput,
  DragDropManager as AbstractDragDropManager,
  PluginConstructor,
} from '@dnd-kit/abstract';
import {effect, reactive} from '@dnd-kit/state';

import {CloneFeedback} from '../../plugins';
import type {Sensors} from '../../sensors';

export interface Input<T extends Data = Data> extends DraggableInput<T> {
  activator?: Element;
  element?: Element;
  feedback?: DraggableFeedback;
  sensors?: Sensors;
}

export type DraggableFeedback = PluginConstructor | null;

export class Draggable<T extends Data = Data> extends AbstractDraggable<T> {
  @reactive
  public activator: Element | undefined;

  @reactive
  public element: Element | undefined;

  @reactive
  public feedback: DraggableFeedback;

  @reactive
  public sensors: Sensors | undefined;

  constructor(
    {activator, element, feedback = CloneFeedback, sensors, ...input}: Input<T>,
    protected manager: AbstractDragDropManager<any, any>
  ) {
    super(input, manager);

    this.activator = activator;
    this.element = element;
    this.feedback = feedback;
    this.sensors = sensors;

    const effectCleanup = effect(() => {
      const sensors = this.sensors?.map(descriptor) ?? [...manager.sensors];
      const unbindFunctions = sensors.map((entry) => {
        const sensorInstance =
          entry instanceof Sensor
            ? entry
            : manager.sensors.get(entry.plugin) ??
              manager.sensors.register(entry.plugin);
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
