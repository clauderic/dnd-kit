import {
  DragDropManager as AbstractDragDropManager,
  DragDropManagerInput,
  resolveCustomizable,
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
  StyleInjector,
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
    const plugins = resolveCustomizable(input.plugins, defaultPreset.plugins);
    const sensors = resolveCustomizable(input.sensors, defaultPreset.sensors);
    const modifiers = resolveCustomizable(
      input.modifiers,
      defaultPreset.modifiers
    );

    super({
      ...input,
      plugins: [ScrollListener, Scroller, StyleInjector, ...plugins],
      sensors,
      modifiers,
    });
  }
}
