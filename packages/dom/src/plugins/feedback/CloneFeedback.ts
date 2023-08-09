import {Plugin} from '@dnd-kit/abstract';
import type {CleanupFunction} from '@dnd-kit/types';
import {effect} from '@dnd-kit/state';
import {cloneElement} from '@dnd-kit/dom-utilities';

import type {DragDropManager} from '../../manager';
import {DOMRectangle} from '../../shapes';

import {createOverlay} from './Overlay';

interface Options {}

export class CloneFeedback extends Plugin<DragDropManager> {
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
        source.feedback !== CloneFeedback
      ) {
        return;
      }

      const {element} = source;
      const {boundingRectangle} = new DOMRectangle(element);
      const overlay = createOverlay(manager, boundingRectangle);

      const clonedElement = cloneElement(element);
      overlay.appendChild(clonedElement);
      overlay.appendTo(document.body);

      if (element instanceof HTMLElement) {
        element.style.visibility = 'hidden';
      }

      return () => {
        overlay.remove();

        if (element instanceof HTMLElement) {
          element.style.visibility = '';
        }
      };
    });
  }
}
