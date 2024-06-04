import {DragDropManager, Draggable, Droppable} from '@dnd-kit/dom';

import draggableIconSrc from '../../assets/draggableIcon.svg';
import {createVanillaStory} from '../utilities';

export const DroppableExample = createVanillaStory(() => {
  const manager = new DragDropManager();
  const wrapperElement = createWrapperElement();
  const droppableElement = createDroppableElement();
  const draggableElement = createDraggableElement();

  wrapperElement.append(draggableElement, droppableElement);
  document.body.appendChild(wrapperElement);

  const draggable = new Draggable(
    {
      id: 'draggable',
      element: draggableElement,
      effects: () => [
        () => {
          const {status} = manager.dragOperation;

          if (draggable.isDragSource && (status.dragging || status.dropped)) {
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

    if (event.operation.target?.id === 'droppable') {
      droppableElement.appendChild(draggableElement);
      droppableElement.setAttribute('data-dropped', 'true');
    } else {
      wrapperElement.prepend(draggableElement);
      droppableElement.removeAttribute('data-dropped');
    }
  });

  return () => {
    draggable.destroy();
    droppable.destroy();
    manager.destroy();
    wrapperElement.remove();
  };
});

function createWrapperElement() {
  const wrapper = document.createElement('div');

  wrapper.style.setProperty('display', 'grid');
  wrapper.style.setProperty('grid-template-columns', '250px max-content');
  wrapper.style.setProperty('align-items', 'center');
  wrapper.style.setProperty('justify-content', 'center');
  wrapper.style.setProperty('gap', '50px');

  return wrapper;
}

function createDroppableElement() {
  const element = document.createElement('dropzone-component');
  element.style.setProperty('grid-column-start', '2');

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
