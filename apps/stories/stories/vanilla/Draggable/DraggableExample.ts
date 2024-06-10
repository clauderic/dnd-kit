import {DragDropManager, Draggable} from '@dnd-kit/dom';

import draggableIconSrc from '../../assets/draggableIcon.svg';
import {createVanillaStory} from '../utilities.ts';

export const DraggableExample = createVanillaStory(() => {
  const manager = new DragDropManager();
  const wrapperElement = createWrapperElement();
  const draggableElement = createDraggableElement();

  wrapperElement.append(draggableElement);
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

  return () => {
    draggable.destroy();
    manager.destroy();
    wrapperElement.remove();
  };
});

function createWrapperElement() {
  const wrapper = document.createElement('div');

  return wrapper;
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
