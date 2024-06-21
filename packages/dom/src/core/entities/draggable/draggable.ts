import {
  Draggable as AbstractDraggable,
  Sensor,
  descriptor,
} from '@dnd-kit/abstract';
import type {
  Data,
  DraggableInput,
  DragDropManager as AbstractDragDropManager,
  Modifiers,
} from '@dnd-kit/abstract';
import {reactive} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager/index.ts';
import type {Sensors} from '../../sensors/index.ts';

export type FeedbackType = 'default' | 'move' | 'clone' | 'none';

export interface Input<T extends Data = Data> extends DraggableInput<T> {
  handle?: Element;
  element?: Element;
  feedback?: FeedbackType;
  sensors?: Sensors;
  modifiers?: Modifiers<DragDropManager>;
}

export class Draggable<T extends Data = Data> extends AbstractDraggable<T> {
  @reactive
  public accessor handle: Element | undefined;

  @reactive
  public accessor element: Element | undefined;

  @reactive
  public accessor feedback: FeedbackType;

  constructor(
    {
      element,
      effects = () => [],
      handle,
      feedback = 'default',
      ...input
    }: Input<T>,
    manager: AbstractDragDropManager<any, any> | undefined
  ) {
    super(
      {
        effects: () => [
          ...effects(),
          () => {
            const {manager} = this;

            if (!manager) return;

            const sensors = this.sensors?.map(descriptor) ?? [
              ...manager.sensors,
            ];
            const unbindFunctions = sensors.map((entry) => {
              const sensorInstance =
                entry instanceof Sensor
                  ? entry
                  : manager.registry.register(entry.plugin);
              const options =
                entry instanceof Sensor ? undefined : entry.options;

              const unbind = sensorInstance.bind(this, options);
              return unbind;
            });

            return function cleanup() {
              unbindFunctions.forEach((unbind) => unbind());
            };
          },
        ],
        ...input,
      },
      manager
    );

    this.element = element;
    this.handle = handle;
    this.feedback = feedback;
  }
}
