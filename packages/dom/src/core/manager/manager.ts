import {
  DragDropManager as AbstractDragDropManager,
  DragDropManagerInput,
  type Data,
  type Modifiers,
  type Plugins,
  type Sensors,
} from '@dnd-kit/abstract';

import type {Draggable, Droppable} from '../entities/index.ts';
import {
  Accessibility,
  AutoScroller,
  Cursor,
  Feedback,
  Scroller,
  ScrollListener,
  PreventSelection,
  StyleSheetManager,
} from '../plugins/index.ts';
import {KeyboardSensor} from '../sensors/keyboard/KeyboardSensor.ts';
import {PointerSensor} from '../sensors/pointer/PointerSensor.ts';

export interface Input extends DragDropManagerInput<DragDropManager> {}

export const defaultPreset: {
  modifiers: Modifiers<DragDropManager>;
  plugins: Plugins<DragDropManager>;
  sensors: Sensors<DragDropManager>;
} = {
  modifiers: [],
  plugins: [Accessibility, AutoScroller, Cursor, Feedback, PreventSelection],
  sensors: [PointerSensor, KeyboardSensor],
};

export class DragDropManager<
  T extends Data = Data,
  U extends Draggable<T> = Draggable<T>,
  V extends Droppable<T> = Droppable<T>,
> extends AbstractDragDropManager<U, V> {
  constructor(input: Input = {}) {
    const {
      plugins = defaultPreset.plugins,
      sensors = defaultPreset.sensors,
      modifiers = [],
    } = input;

    super({
      ...input,
      plugins: [ScrollListener, Scroller, StyleSheetManager, ...plugins],
      sensors,
      modifiers,
    });
  }
}
