import {
  DragDropManager as AbstractDragDropManager,
  DragDropManagerInput,
  PluginConstructor,
  SensorConstructor,
} from '@dnd-kit/abstract';

import type {Draggable, Droppable} from '../nodes';
import {AutoScroller, DraggablePlaceholder, ScrollManager} from '../plugins';
import {PointerSensor} from '../sensors';

export interface Input extends DragDropManagerInput<DragDropManager> {}

const defaultPlugins: PluginConstructor<DragDropManager>[] = [
  AutoScroller,
  DraggablePlaceholder,
];

const defaultSensors: SensorConstructor<DragDropManager>[] = [PointerSensor];

export class DragDropManager<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
> extends AbstractDragDropManager<Draggable, Droppable> {
  public scrollManager: ScrollManager;

  constructor({
    plugins = defaultPlugins,
    sensors = defaultSensors,
    ...input
  }: Input = {}) {
    super({...input, plugins, sensors});

    this.scrollManager = new ScrollManager(this);
  }

  public destroy() {
    super.destroy();
    this.scrollManager.destroy();
  }
}
