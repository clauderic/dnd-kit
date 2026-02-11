import {DragDropManager, Draggable} from '@dnd-kit/dom';

export default function App() {
  const root = document.getElementById('root')!;

  const manager = new DragDropManager();
  const button = document.createElement('button');
  button.className = 'btn';
  button.textContent = 'draggable';
  root.appendChild(button);

  new Draggable({id: 'draggable', element: button}, manager);
}
