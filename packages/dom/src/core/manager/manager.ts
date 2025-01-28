import {
  DragDropManager as AbstractDragDropManager,
  DragDropManagerInput,
  type Modifiers,
  type Plugins,
  type Sensors,
} from '@dnd-kit/abstract';
import {isElement} from '@dnd-kit/dom/utilities';

import type {Draggable, Droppable} from '../entities/index.ts';
import {
  Accessibility,
  AutoScroller,
  Cursor,
  Feedback,
  Scroller,
  ScrollListener,
  PreventSelection,
} from '../plugins/index.ts';
import {KeyboardSensor, PointerSensor} from '../sensors/index.ts';

export interface Input extends DragDropManagerInput<DragDropManager> {}

export const defaultPreset: {
  modifiers: Modifiers<DragDropManager>;
  plugins: Plugins<DragDropManager>;
  sensors: Sensors<DragDropManager>;
} = {
  modifiers: [],
  plugins: [Accessibility, AutoScroller, Cursor, Feedback, PreventSelection],
  sensors: [
    PointerSensor.configure({
      activationConstraints(event, source) {
        const {pointerType, target} = event;

        if (
          pointerType === 'mouse' &&
          isElement(target) &&
          (source.handle === target || source.handle?.contains(target))
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
  constructor(input: Input = {}) {
    const {
      plugins = defaultPreset.plugins,
      sensors = defaultPreset.sensors,
      modifiers = [],
    } = input;

    super({
      ...input,
      plugins: [ScrollListener, Scroller, ...plugins],
      sensors,
      modifiers,
    });
  }
}
