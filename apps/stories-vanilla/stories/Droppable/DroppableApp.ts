import {DragDropManager, Draggable, Droppable} from '@dnd-kit/dom';

export default function App() {
  const root = document.getElementById('root')!;

  const section = document.createElement('section');
  section.style.cssText =
    'display:grid;grid-template-columns:2fr 1fr;gap:20px;align-items:center;max-width:700px;margin:0 auto';

  const left = document.createElement('div');
  left.style.cssText = 'display:flex;justify-content:center';

  const button = document.createElement('button');
  button.className = 'btn';
  button.textContent = 'draggable';
  left.appendChild(button);

  const dropzone = document.createElement('div');
  dropzone.className = 'droppable';

  section.append(left, dropzone);
  root.appendChild(section);

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
      left.appendChild(button);
    }
  });
}
