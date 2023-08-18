import {DragDropManager, Draggable, Droppable} from '@dnd-kit/dom';

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
    },
    manager
  );
  const droppable = new Droppable(
    {
      id: 'droppable',
      element: droppableElement,
      effects(droppable) {
        return [
          () => {
            if (droppable.isDropTarget) {
              droppableElement.style.setProperty('background', 'lightgreen');

              return () => {
                droppableElement.style.removeProperty('background');
              };
            }
          },
        ];
      },
    },
    manager
  );

  manager.monitor.addEventListener('dragend', (event) => {
    if (event.canceled) {
      return;
    }

    if (event.operation.target?.id === 'droppable') {
      droppableElement.appendChild(draggableElement);
    } else {
      wrapperElement.prepend(draggableElement);
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

  wrapper.style.setProperty('display', 'flex');
  wrapper.style.setProperty('align-items', 'center');
  wrapper.style.setProperty('justify-content', 'center');
  wrapper.style.setProperty('gap', '50px');

  return wrapper;
}

function createDroppableElement() {
  const element = document.createElement('div');

  element.style.setProperty('display', 'flex');
  element.style.setProperty('align-items', 'center');
  element.style.setProperty('justify-content', 'center');
  element.style.setProperty('width', '335px');
  element.style.setProperty('height', '335px');
  element.style.setProperty('background', 'rgb(255, 255, 255)');
  element.style.setProperty('border', '2px solid rgba(0, 0, 0, 0.2)');
  element.style.setProperty('border-radius', '10px');

  return element;
}

function createDraggableElement() {
  const element = document.createElement('button');
  element.innerText = 'Draggable';

  return element;
}
