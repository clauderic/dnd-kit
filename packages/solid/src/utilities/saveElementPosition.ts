import type {UniqueIdentifier} from '@dnd-kit/abstract';
import type {Draggable} from '@dnd-kit/dom';

// Workaround for SolidJS issue:
// https://github.com/solidjs/solid/issues/2515
export function createSaveElementPosition() {
  let savedPosition: {
    id: UniqueIdentifier | null;
    element: Element;
    prevElement: Element | null;
    nextElement: Element | null;
    parentElement: HTMLElement | null;
  } | null = null;

  const savePosition = (source: Draggable) => {
    const element = source.element!;
    const id = source.id;

    const prevElement = element.previousElementSibling;
    const nextElement = element.nextElementSibling;
    const parentElement = element.parentElement;

    savedPosition = {
      id,
      element,
      prevElement: prevElement === element ? null : prevElement,
      nextElement: nextElement === element ? null : nextElement,
      parentElement,
    };
  };

  const restorePosition = (element: Element) => {
    if (!savedPosition) return;

    const {prevElement, nextElement, parentElement} = savedPosition;

    if (prevElement && element.previousElementSibling !== prevElement) {
      prevElement.insertAdjacentElement('afterend', element);
    } else if (nextElement && element.nextElementSibling !== nextElement) {
      nextElement.insertAdjacentElement('beforebegin', element);
    } else if (!prevElement && !nextElement && parentElement) {
      parentElement.appendChild(element);
    }
  };

  const clearPosition = () => {
    savedPosition = null;
  };

  return {
    savePosition,
    clearPosition,
    restorePosition,
  };
}
