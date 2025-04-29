import {
  DragDropManager as AbstractDragDropManager,
  DragDropManagerInput,
  type Renderer,
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
  sensors: [PointerSensor, KeyboardSensor],
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
