import {Plugin} from '@dnd-kit/abstract';
import type {CleanupFunction} from '@dnd-kit/types';
import {effect} from '@dnd-kit/state';
import {cloneElement} from '@dnd-kit/dom-utilities';

import type {DragDropManager} from '../../manager';
import {createOverlay} from './DraggableOverlay';

interface Options {}

export class DraggableClone extends Plugin<DragDropManager> {
  public destroy: CleanupFunction;

  constructor(manager: DragDropManager, _options?: Options) {
    super(manager);

    this.destroy = effect(() => {
      const {dragOperation} = manager;
      const {status, source} = dragOperation;
      const isDragging = status === 'dragging';

      if (!isDragging || !source || !source.feedback || !source.element) {
        return;
      }

      const {element} = source;
      const overlay = createOverlay(manager, element);
      const clonedElement = cloneElement(element);

      overlay.appendChild(clonedElement);
      document.body.appendChild(overlay);

      return () => {
        overlay.remove();
      };
    });
  }
}
