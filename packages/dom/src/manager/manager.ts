import {
  DragDropManager as AbstractDragDropManager,
  DragDropManagerInput,
  configure,
  type Plugins,
  type Sensors,
} from '@dnd-kit/abstract';
import {batch, effect} from '@dnd-kit/state';

import type {Draggable, Droppable} from '../nodes';
import {
  AutoScroller,
  CloneFeedback,
  PlaceholderFeedback,
  RestoreFocus,
  ScrollManager,
  Scroller,
  Debug,
} from '../plugins';
import {KeyboardSensor, PointerSensor} from '../sensors';
import {DragSourceDeltaModifier} from '../modifiers';

export interface Input extends DragDropManagerInput<any> {}

export const defaultPreset: {
  plugins: Plugins<DragDropManager>;
  sensors: Sensors<DragDropManager>;
} = {
  plugins: [
    // Debug,
    AutoScroller,
    CloneFeedback,
    PlaceholderFeedback,
    RestoreFocus,
  ],
  sensors: [
    configure(PointerSensor, {
      activationConstraints: {
        delay: {value: 200, tolerance: 10},
        distance: {value: 5},
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
      plugins: [ScrollManager, Scroller, ...plugins],
      sensors,
      modifiers: [DragSourceDeltaModifier, ...modifiers],
    });

    const effectCleanup = effect(() => {
      if (this.dragOperation.status === 'initializing') {
        batch(() => {
          for (const droppable of this.registry.droppable) {
            droppable.updateShape();
          }
        });
      }
    });

    this.destroy = () => {
      effectCleanup();
      super.destroy();
    };
  }
}
