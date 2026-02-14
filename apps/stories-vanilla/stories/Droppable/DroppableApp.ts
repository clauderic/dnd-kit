import {DragDropManager, Draggable, Droppable} from '@dnd-kit/dom';

export default function App() {
  const section = document.createElement('section');
  section.className = 'drop-layout';

  const button = document.createElement('button');
  button.className = 'btn';
  button.textContent = 'draggable';

  const dropzone = document.createElement('div');
  dropzone.className = 'droppable';

  section.append(button, dropzone);

  const manager = new DragDropManager();

  const draggable = new Draggable({id: 'draggable', element: button}, manager);

  const droppable = new Droppable(
    {
      id: 'droppable',
      element: dropzone,
      effects: () => [
        () => {
          if (droppable.isDropTarget) {
            dropzone.classList.add('active');
            return () => dropzone.classList.remove('active');
          }
        },
      ],
    },
    manager
  );

  manager.monitor.addEventListener('dragend', (event) => {
    if (event.canceled) return;

    const isInside = dropzone.contains(button);

    if (event.operation.target?.id === 'droppable') {
      if (!isInside) dropzone.appendChild(button);
    } else if (isInside) {
      section.prepend(button);
    }
  });

  return section;
}
