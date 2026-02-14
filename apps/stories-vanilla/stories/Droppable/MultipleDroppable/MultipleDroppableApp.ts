import {DragDropManager, Draggable, Droppable} from '@dnd-kit/dom';

export default function App() {
  const root = document.createElement('div');
  root.style.display = 'grid';
  root.style.gridTemplateColumns = '1fr 1fr';
  root.style.gap = '20px';
  root.style.maxWidth = '500px';
  root.style.margin = '0 auto';

  const buttonWrapper = document.createElement('div');
  buttonWrapper.style.display = 'flex';
  buttonWrapper.style.alignItems = 'center';
  buttonWrapper.style.justifyContent = 'center';

  const button = document.createElement('button');
  button.className = 'btn';
  button.textContent = 'draggable';

  buttonWrapper.appendChild(button);
  root.appendChild(buttonWrapper);

  const manager = new DragDropManager();
  const droppableIds = ['A', 'B', 'C'];
  const dropzones: Record<string, HTMLElement> = {};

  new Draggable({id: 'draggable', element: button}, manager);

  for (const id of droppableIds) {
    const dropzone = document.createElement('div');
    dropzone.className = 'droppable';
    dropzones[id] = dropzone;
    root.appendChild(dropzone);

    const droppable = new Droppable(
      {
        id,
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
  }

  manager.monitor.addEventListener('dragend', (event) => {
    if (event.canceled) return;

    const targetId = event.operation.target?.id as string;

    // Find which dropzone currently contains the button
    const currentParent = Object.entries(dropzones).find(([, el]) =>
      el.contains(button)
    );

    if (targetId && dropzones[targetId]) {
      if (!dropzones[targetId].contains(button)) {
        dropzones[targetId].appendChild(button);
      }
    } else if (currentParent) {
      buttonWrapper.appendChild(button);
    }
  });

  return root;
}
