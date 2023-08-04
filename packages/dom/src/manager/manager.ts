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
} from '../plugins';
import {KeyboardSensor, PointerSensor} from '../sensors';
import {DragSourceDeltaModifier} from '../modifiers';

export interface Input extends DragDropManagerInput<DragDropManager> {}

const defaultPlugins: Plugins<DragDropManager> = [
  AutoScroller,
  CloneFeedback,
  PlaceholderFeedback,
  RestoreFocus,
];

const defaultSensors: Sensors<DragDropManager> = [
  configure(PointerSensor, {
    activationConstraints: {
      delay: {value: 200, tolerance: 10},
      distance: {value: 5},
    },
  }),
  KeyboardSensor,
];

export class DragDropManager<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
> extends AbstractDragDropManager<Draggable, Droppable> {
  public scroller: Scroller;

  constructor({
    plugins = defaultPlugins,
    sensors = defaultSensors,
    modifiers = [],
    ...input
  }: Input = {}) {
    super({
      ...input,
      plugins,
      sensors,
      modifiers: [DragSourceDeltaModifier, ...modifiers],
    });

    const scrollManager = new ScrollManager(this);
    this.scroller = new Scroller(this);

    const effectCleanup = effect(() => {
      if (this.dragOperation.status === 'initializing') {
        batch(() => {
          for (const droppable of this.registry.droppable) {
            droppable.updateShape();
          }
        });
      }
    });

    const {destroy} = this;

    this.destroy = () => {
      effectCleanup();
      scrollManager.destroy();
      destroy();
    };
  }

  public destroy = () => {
    super.destroy();
    this.scroller.destroy();
  };
}
