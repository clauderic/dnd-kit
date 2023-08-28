import {CorePlugin} from '@dnd-kit/abstract';
import {batch, computed, effect, signal, untracked} from '@dnd-kit/state';
import type {CleanupFunction} from '@dnd-kit/state';
import {
  createPlaceholder,
  DOMRectangle,
  scrollIntoViewIfNeeded,
  supportsStyle,
} from '@dnd-kit/dom/utilities';

import type {DragDropManager} from '../../manager/index.js';

import {Overlay} from './Overlay.js';
import {patchElement} from './utilities.js';
import type {Transition} from './types.js';

interface DraggableFeedbackOptions {
  tagName?: string;
  transition?: Transition | null;
}

export class DraggableFeedback extends CorePlugin<DragDropManager> {
  public destroy: CleanupFunction;

  constructor(
    manager: DragDropManager,
    options: DraggableFeedbackOptions = {}
  ) {
    super(manager);

    let overlay: Overlay | undefined;

    const element = signal<Element | null>(null);
    const placeholder = signal<Element | null>(null);

    const feedback = computed(() => {
      return manager.dragOperation.source?.feedback;
    });

    const setPlaceholderElement = (element: Element | undefined) => {
      untracked(() => {
        const id = manager.dragOperation.source?.id;

        if (id == null) {
          return;
        }

        const droppable = manager.registry.droppables.get(id);

        if (droppable) {
          droppable.placeholder = element;
        }
      });
    };

    const unmount = () =>
      untracked(() => {
        if (!overlay) {
          return;
        }

        const currentElement = element.value;
        const placeholderElement = placeholder.value;

        if (currentElement && placeholderElement) {
          placeholderElement.replaceWith(currentElement);
          placeholder.value = null;
          element.value = null;
        }

        setPlaceholderElement(undefined);

        const id = manager.dragOperation.source?.id;
        const restoreFocus = () => {
          if (id == null) {
            return;
          }

          const draggable = manager.registry.draggables.get(id);
          const element = draggable?.handle ?? draggable?.element;

          if (element instanceof HTMLElement) {
            element.focus();
          }
        };

        overlay?.remove().then(() => {
          restoreFocus();
          manager.dragOperation.shape = null;
        });

        overlay = undefined;
      });

    const effects = [
      effect(() => {
        if (manager.dragOperation.status.dropping) {
          unmount();
        }
      }),
      effect(() => {
        const currentElement = element.value;
        const placeholderElement = placeholder.value;

        if (!overlay || !currentElement || !placeholderElement) {
          return;
        }

        const {parentElement} = currentElement;
        const upatch = parentElement
          ? patchElement(parentElement, currentElement, placeholderElement)
          : undefined;

        if (feedback.peek() !== 'move') {
          setPlaceholderElement(placeholderElement);
        }

        if (!overlay.contains(currentElement)) {
          currentElement.replaceWith(placeholderElement);
          overlay.children = currentElement;
        }

        if (!overlay.isConnected) {
          overlay.appendTo(document.body);
        }

        const feedbackType = feedback.peek();

        const mutationObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (Array.from(mutation.addedNodes).includes(currentElement)) {
              if (overlay && !overlay.contains(currentElement)) {
                currentElement.replaceWith(placeholderElement);
              }
            }
          }
        });

        mutationObserver.observe(document, {
          childList: true,
          subtree: true,
        });

        const resizeObserver = new ResizeObserver(() => {
          const {width, height} = new DOMRectangle(placeholderElement, true);

          overlay?.resize(width, height);
        });
        resizeObserver.observe(placeholderElement);

        const mutationObservers: MutationObserver[] = [mutationObserver];

        const elementMutationObserver = new MutationObserver(() => {
          if (currentElement && placeholderElement) {
            const newPlacholder = createPlaceholder(
              currentElement,
              feedbackType === 'clone'
            );

            for (const attribute of Array.from(newPlacholder.attributes)) {
              placeholderElement.setAttribute(attribute.name, attribute.value);
            }

            placeholderElement.innerHTML = newPlacholder.innerHTML;
          }
        });

        elementMutationObserver.observe(currentElement, {
          subtree: true,
          childList: true,
          attributes: true,
          characterData: true,
        });

        mutationObservers.push(elementMutationObserver);

        return () => {
          resizeObserver.disconnect();
          mutationObservers.forEach((observer) => observer.disconnect());
          upatch?.();
        };
      }),
      effect(() => {
        const {source, status} = manager.dragOperation;

        if (
          !status.initialized ||
          !source?.element ||
          source.feedback === 'none'
        ) {
          return;
        }

        const clone = source.feedback === 'clone';
        const currentElement = source.element;

        if (!overlay) {
          scrollIntoViewIfNeeded(currentElement);

          overlay = new Overlay(manager, {
            anchor: currentElement,
            tagName: options.tagName,
            transition: options.transition,
          });
        }

        const currentPlaceholder = placeholder.peek();
        const placeholderElement = createPlaceholder(currentElement, clone);

        if (source.feedback === 'move') {
          if (supportsStyle(placeholderElement)) {
            placeholderElement.style.display = 'none';
          }
        }

        if (currentPlaceholder) {
          currentPlaceholder.replaceWith(placeholderElement);
        }

        batch(() => {
          element.value = currentElement;
          placeholder.value = placeholderElement;
        });
      }),
    ];

    this.destroy = () => {
      unmount();
      effects.forEach((cleanup) => cleanup());
    };
  }
}
