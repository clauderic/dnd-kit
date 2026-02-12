import {DragDropManager, Draggable, Droppable} from '@dnd-kit/dom';

import draggableIconSrc from '@dnd-kit/stories-shared/assets/draggableIcon.svg';

export function DroppableExample() {
  const root = document.createElement('section');
  const left = document.createElement('div');
  left.style.cssText = 'display:flex;justify-content:center';

  const manager = new DragDropManager();
  const droppableElement = createDroppableElement();
  const draggableElement = createDraggableElement();

  left.append(draggableElement);
  root.append(left, droppableElement);

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
  const droppable = new Droppable(
    {
      id: 'droppable',
      element: droppableElement,
      effects: () => [
        () => {
          if (droppable.isDropTarget) {
            droppableElement.setAttribute('data-highlight', 'true');

            return () => {
              droppableElement.removeAttribute('data-highlight');
            };
          }
        },
      ],
    },
    manager
  );

  manager.monitor.addEventListener('dragend', (event) => {
    if (event.canceled) {
      return;
    }

    const isWithinDroppable = droppableElement.contains(draggableElement);

    if (event.operation.target?.id === 'droppable') {
      if (!isWithinDroppable) droppableElement.appendChild(draggableElement);
    } else if (isWithinDroppable) {
      left.prepend(draggableElement);
    }
  });

  return {
    root,
    cleanup: () => {
      draggable.destroy();
      droppable.destroy();
      manager.destroy();
    },
  };
}

function createDroppableElement() {
  const element = document.createElement('dropzone-component');
  return element;
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
