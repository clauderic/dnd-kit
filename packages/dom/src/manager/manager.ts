import {
  DragDropManager as AbstractDragDropManager,
  DragDropManagerInput,
  PluginConstructor,
} from '@dnd-kit/abstract';

import type {Draggable, Droppable} from '../nodes';
import {AutoScroller, DraggablePlaceholder, ScrollManager} from '../plugins';

export interface Input extends DragDropManagerInput {}

const defaultPlugins: PluginConstructor<DragDropManager>[] = [
  AutoScroller,
  DraggablePlaceholder,
];

export class DragDropManager extends AbstractDragDropManager<
  Draggable,
  Droppable
> {
  public scrollManager: ScrollManager;

  constructor({plugins = defaultPlugins, ...input}: Input = {}) {
    super({...input, plugins});

    this.scrollManager = new ScrollManager(this);
  }

  public destroy() {
    super.destroy();
    this.scrollManager.destroy();
  }
}
