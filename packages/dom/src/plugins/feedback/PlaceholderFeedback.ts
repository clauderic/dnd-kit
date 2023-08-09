import {Plugin} from '@dnd-kit/abstract';
import type {CleanupFunction} from '@dnd-kit/types';
import {effect, untracked} from '@dnd-kit/state';
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
        source.feedback !== PlaceholderFeedback
      ) {
        return;
      }

      const cleanupFns: CleanupFunction[] = [];
      const {element} = source;
      const {boundingRectangle} = new DOMRectangle(element);
      const overlay = createOverlay(manager, boundingRectangle);
      const placeholder = document.createElement('div');

      placeholder.style.width = `${boundingRectangle.width}px`;
      placeholder.style.height = `${boundingRectangle.height}px`;

      const {parentElement} = element;

      element.replaceWith(placeholder);
      overlay.appendChild(element);
      overlay.appendTo(document.body);

      let ignoreNextMutation = false;

      const {id} = source;

      if (parentElement) {
        const {insertBefore, appendChild} = parentElement;

        parentElement.appendChild = ((node: Node) => {
          try {
            if (node === element) {
              return appendChild.call(parentElement, placeholder);
            }

            return appendChild.call(parentElement, node);
          } catch (error) {
            // no-op
            console.error(error, node);
          }
        }) as Node['appendChild'];

        parentElement.insertBefore = ((
          node: Node,
          referenceNode: Node | null
        ) => {
          try {
            if (node === element) {
              insertBefore.call(parentElement, placeholder, referenceNode);
              return;
            }

            if (referenceNode === element) {
              insertBefore.call(parentElement, node, placeholder);
              return;
            }

            return insertBefore.call(parentElement, node, referenceNode);
          } catch (error) {
            // no-op
            console.error(error, node, referenceNode);
          }
        }) as Node['insertBefore'];

        cleanupFns.push(() => {
          parentElement.appendChild = appendChild;
          parentElement.insertBefore = insertBefore;
        });
      }

      const placeholderReplacement = () => {
        const droppable = manager.registry.droppable.get(id);

        if (droppable && droppable.element === source.element) {
          droppable.element = placeholder;
        }
      };

      untracked(placeholderReplacement);

      const mutationObserver = new MutationObserver((mutations) => {
        if (ignoreNextMutation) {
          ignoreNextMutation = false;
          return;
        }

        for (const mutation of mutations) {
          if (Array.from(mutation.addedNodes).includes(element)) {
            ignoreNextMutation = true;

            console.log(mutation);

            element.replaceWith(placeholder);
            overlay.appendChild(element);

            placeholderReplacement();
          }
        }
      });

      mutationObserver.observe(document, {childList: true, subtree: true});

      return () => {
        mutationObserver.disconnect();
        cleanupFns.forEach((cleanup) => cleanup());

        const clone = cloneElement(element);
        element.replaceWith(clone);
        placeholder.replaceWith(element);
        overlay.remove();

        const droppable = manager.registry.droppable.get(id);

        if (droppable && droppable.element === placeholder) {
          droppable.element = element;
        }
      };
    });
  }
}
