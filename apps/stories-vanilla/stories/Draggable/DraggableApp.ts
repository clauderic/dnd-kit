import {DragDropManager, Draggable} from '@dnd-kit/dom';

export default function App() {
  const root = document.createElement('div');

  const button = document.createElement('button');
  button.className = 'btn';
  button.textContent = 'draggable';
  root.appendChild(button);

  const manager = new DragDropManager();
  new Draggable({id: 'draggable', element: button}, manager);

  return root;
}
