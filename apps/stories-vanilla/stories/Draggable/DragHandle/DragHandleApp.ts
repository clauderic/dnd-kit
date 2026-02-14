import {DragDropManager, Draggable} from '@dnd-kit/dom';

export default function App() {
  const root = document.createElement('div');

  const button = document.createElement('div');
  button.className = 'btn';
  button.append('draggable');

  const handle = document.createElement('button');
  handle.className = 'handle';
  button.appendChild(handle);

  root.appendChild(button);

  const manager = new DragDropManager();

  new Draggable(
    {
      id: 'draggable',
      element: button,
      handle,
    },
    manager
  );

  return root;
}
