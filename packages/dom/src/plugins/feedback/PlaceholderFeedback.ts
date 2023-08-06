import {Plugin} from '@dnd-kit/abstract';
import type {CleanupFunction} from '@dnd-kit/types';
import {effect} from '@dnd-kit/state';
import {cloneElement} from '@dnd-kit/dom-utilities';

import type {DragDropManager} from '../../manager';
import {DOMRectangle} from '../../shapes';

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
      const {boundingRectangle} = new DOMRectangle(element);
      const overlay = createOverlay(manager, boundingRectangle);
      const placeholder = document.createElement('div');

      placeholder.style.width = `${boundingRectangle.width}px`;
      placeholder.style.height = `${boundingRectangle.height}px`;

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
