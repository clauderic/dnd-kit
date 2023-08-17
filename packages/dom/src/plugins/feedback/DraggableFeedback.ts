import {CorePlugin} from '@dnd-kit/abstract';
import {batch, computed, effect, signal, untracked} from '@dnd-kit/state';
import type {CleanupFunction} from '@dnd-kit/state';
import {createPlaceholder, DOMRectangle} from '@dnd-kit/dom-utilities';

import type {DragDropManager} from '../../manager';

import {Overlay} from './Overlay';
import {patchElement} from './utilities';

export class DraggableFeedback extends CorePlugin<DragDropManager> {
  public destroy: CleanupFunction;

  constructor(manager: DragDropManager) {
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

        overlay?.remove();

        overlay = undefined;
      });

    const effects = [
      effect(() => {
        if (manager.dragOperation.status.dropping) {
          manager.renderer.rendering.then(unmount);
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

        let mutationObserver: MutationObserver | undefined;
        const feedbackType = feedback.peek();

        if (feedbackType === 'clone') {
          mutationObserver = new MutationObserver(() => {
            if (currentElement && placeholderElement) {
              const newPlacholder = createPlaceholder(
                currentElement,
                undefined,
                true
              );

              for (const attribute of Array.from(newPlacholder.attributes)) {
                placeholderElement.setAttribute(
                  attribute.name,
                  attribute.value
                );
              }

              placeholderElement.innerHTML = newPlacholder.innerHTML;
            }
          });

          mutationObserver.observe(currentElement, {
            subtree: true,
            childList: true,
            attributes: true,
            characterData: true,
          });
        }

        return () => {
          mutationObserver?.disconnect();
          upatch?.();
        };
      }),
      effect(() => {
        const {source, status} = manager.dragOperation;

        if (
          !status.initialized ||
          !source?.element ||
          !source.feedback ||
          source.feedback === 'custom'
        ) {
          return;
        }

        const clone = source.feedback === 'clone';
        const currentElement = source.element;
        const shape = new DOMRectangle(currentElement);

        if (!overlay) {
          overlay = new Overlay(
            manager,
            currentElement,
            shape,
            currentElement.parentElement?.tagName.toLowerCase()
          );
        }

        const currentPlaceholder = placeholder.peek();
        const placeholderElement = createPlaceholder(
          currentElement,
          shape,
          clone
        );

        if (source.feedback === 'move') {
          if (placeholderElement instanceof HTMLElement) {
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

// const resizeObserver = new ResizeObserver((entries) => {
//   const [entry] = entries;
//   const [size] = entry.borderBoxSize;
//   const {blockSize, inlineSize} = size;

//   placeholder.style.width = `${inlineSize}px`;
//   placeholder.style.height = `${blockSize}px`;
// });

// resizeObserver.observe(element, {box: 'border-box'});

// cleanupFns.push(() => resizeObserver.disconnect());
