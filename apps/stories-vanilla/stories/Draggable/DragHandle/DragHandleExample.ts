import {DragDropManager, Draggable} from '@dnd-kit/dom';

import draggableIconSrc from '@dnd-kit/stories-shared/assets/draggableIcon.svg';

export function DragHandleExample() {
  const root = document.createElement('div');

  const manager = new DragDropManager();
  const draggableElement = createDraggableElement();

  root.append(draggableElement);

  const handleElement = draggableElement.querySelector('handle-component')!;

  const draggable = new Draggable(
    {
      id: 'draggable',
      element: draggableElement,
      handle: handleElement,
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

  const image = document.createElement('img');
  image.src = draggableIconSrc;
  image.alt = 'Draggable';
  image.width = 140;
  image.style.pointerEvents = 'none';
  element.appendChild(image);

  const handle = document.createElement('handle-component');
  element.appendChild(handle);

  return element;
}
