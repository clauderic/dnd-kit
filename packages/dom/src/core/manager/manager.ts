import {
  DragDropManager as AbstractDragDropManager,
  DragDropManagerInput,
  type Plugins,
  type Sensors,
} from '@dnd-kit/abstract';
import {
  DOMRectangle,
  type DOMRectangleOptions,
  isElement,
} from '@dnd-kit/dom/utilities';

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

export interface Input extends DragDropManagerInput<any> {
  rootDocument?: Document;
}

export const defaultPreset: {
  plugins: Plugins<DragDropManager>;
  sensors: Sensors<DragDropManager>;
} = {
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
      rootDocument = document,
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

    this.rootDocument = rootDocument;
    this.getShape = this.getShape.bind(this);
  }

  public rootDocument: Document;

  public getShape(element: Element, options?: DOMRectangleOptions) {
    return new DOMRectangle(element, {
      ...options,
      rootDocument: this.rootDocument,
    });
  }
}
