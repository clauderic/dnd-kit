import {Plugin} from '@dnd-kit/abstract';
import type {CleanupFunction} from '@dnd-kit/types';
import {effect} from '@dnd-kit/state';
import {cloneElement} from '@dnd-kit/dom-utilities';

import type {DragDropManager} from '../../manager';
import {createOverlay} from './Overlay';

interface Options {}

export class PlaceholderFeedback extends Plugin<DragDropManager> {
  public destroy: CleanupFunction;

  constructor(manager: DragDropManager, _options?: Options) {
    super(manager);

    this.destroy = effect(() => {
      const {dragOperation} = manager;
      const {status, source} = dragOperation;
      const isDragging = status === 'dragging';

      if (
        !isDragging ||
        !source ||
        !source.element ||
        source.feedback !== 'placeholder'
      ) {
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
      overlay.appendTo(document.body);

      return () => {
        const clone = cloneElement(element);
        element.replaceWith(clone);
        placeholder.replaceWith(element);
        overlay.remove();
      };
    });
  }
}
