import {
  DragDropManager as AbstractDragDropManager,
  DragDropManagerInput,
  PluginConstructor,
  SensorConstructor,
} from '@dnd-kit/abstract';
import {batch, effect} from '@dnd-kit/state';

import type {Draggable, Droppable} from '../nodes';
import {
  AutoScroller,
  CloneFeedback,
  PlaceholderFeedback,
  ScrollManager,
  Scroller,
} from '../plugins';
import {PointerSensor} from '../sensors';
import {DragSourceDeltaModifier} from '../modifiers';

export interface Input extends DragDropManagerInput<DragDropManager> {}

const defaultPlugins: PluginConstructor<DragDropManager>[] = [
  AutoScroller,
  CloneFeedback,
  PlaceholderFeedback,
];

const defaultSensors: SensorConstructor<DragDropManager>[] = [PointerSensor];

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
