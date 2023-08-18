import {
  DragDropManager as AbstractDragDropManager,
  DragDropManagerInput,
  type Plugins,
  type Sensors,
} from '@dnd-kit/abstract';

import type {Draggable, Droppable} from '../nodes';
import {
  AutoScroller,
  Cursor,
  DraggableFeedback,
  Scroller,
  ScrollListener,
} from '../plugins';
import {KeyboardSensor, PointerSensor} from '../sensors';

export interface Input extends DragDropManagerInput<any> {}

export const defaultPreset: {
  plugins: Plugins<DragDropManager>;
  sensors: Sensors<DragDropManager>;
} = {
  plugins: [AutoScroller, Cursor, DraggableFeedback],
  sensors: [
    PointerSensor.configure({
      activationConstraints(event, source) {
        const {pointerType, target} = event;

        if (
          pointerType === 'mouse' &&
          target instanceof Element &&
          (source.activator === target || source.activator?.contains(target))
        ) {
          return undefined;
        }

        return {
          delay: {value: 200, tolerance: 10},
          distance: {value: 5},
        };
      },
    }),
    KeyboardSensor,
  ],
};

export class DragDropManager<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
> extends AbstractDragDropManager<Draggable, Droppable> {
  constructor({
    plugins = defaultPreset.plugins,
    sensors = defaultPreset.sensors,
    modifiers = [],
    ...input
  }: Input = {}) {
    super({
      ...input,
      plugins: [ScrollListener, Scroller, ...plugins],
      sensors,
      modifiers,
    });
  }
}
