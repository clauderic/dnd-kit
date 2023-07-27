import {Plugin} from '@dnd-kit/abstract';
import type {CleanupFunction} from '@dnd-kit/types';
import {effect} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager';
import {createOverlay} from './DraggableOverlay';

interface Options {}

export class DraggablePlaceholder extends Plugin<DragDropManager> {
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
      const placeholder = document.createElement('div');
      const {width, height} = element.getBoundingClientRect();

      placeholder.style.width = `${width}px`;
      placeholder.style.height = `${height}px`;

      element.replaceWith(placeholder);

      overlay.appendChild(element);
      document.body.appendChild(overlay);

      return () => {
        placeholder.replaceWith(element);
        overlay.remove();
      };
    });
  }
}
