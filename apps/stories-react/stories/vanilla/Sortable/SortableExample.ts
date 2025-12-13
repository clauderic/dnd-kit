import {DragDropManager} from '@dnd-kit/dom';
import {Sortable} from '@dnd-kit/dom/sortable';

import {createVanillaStory} from '../../utilities';

export const SortableExample = createVanillaStory(() => {
  const manager = new DragDropManager();
  const wrapperElement = createWrapperElement();
  const items = Array.from({length: 101}, (_, index) => index);

  for (const item of items) {
    const element = document.createElement('div');
    element.classList.add('Item');
    element.textContent = item.toString();
    wrapperElement.append(element);

    const sortable = new Sortable(
      {
        id: item,
        element,
        index: item,
        effects: () => [
          () => {
            if (sortable.isDragging) {
              element.setAttribute('data-shadow', 'true');
              return () => element.removeAttribute('data-shadow');
            }
          },
        ],
      },
      manager
    );
  }

  document.body.appendChild(wrapperElement);

  return () => {
    manager.destroy();
    wrapperElement.remove();
  };
});

function createWrapperElement() {
  const wrapper = document.createElement('div');

  wrapper.style.setProperty('display', 'flex');
  wrapper.style.setProperty('flex-direction', 'column');
  wrapper.style.setProperty('align-items', 'center');
  wrapper.style.setProperty('justify-content', 'center');
  wrapper.style.setProperty('gap', '15px');

  return wrapper;
}
