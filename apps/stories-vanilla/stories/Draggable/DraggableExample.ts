import {DragDropManager, Draggable} from '@dnd-kit/dom';

import draggableIconSrc from '@dnd-kit/stories-shared/assets/draggableIcon.svg';

export function DraggableExample() {
  const root = document.createElement('div');

  const manager = new DragDropManager();
  const draggableElement = createDraggableElement();

  root.append(draggableElement);

  const draggable = new Draggable(
    {
      id: 'draggable',
      element: draggableElement,
      effects: () => [
        () => {
          if (draggable.isDragging) {
            draggableElement.setAttribute('data-shadow', 'true');

            return () => {
              draggableElement.removeAttribute('data-shadow');
            };
          }
        },
      ],
    },
    manager
  );

  return {root, cleanup: () => { draggable.destroy(); manager.destroy(); }};
}

function createDraggableElement() {
  const element = document.createElement('button-component');
  element.style.setProperty('width', 'max-content');

  const image = document.createElement('img');
  image.src = draggableIconSrc;
  image.alt = 'Draggable';
  image.width = 140;
  image.style.pointerEvents = 'none';
  element.appendChild(image);

  return element;
}
