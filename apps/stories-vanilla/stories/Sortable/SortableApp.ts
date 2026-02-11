import {DragDropManager} from '@dnd-kit/dom';
import {Sortable} from '@dnd-kit/dom/sortable';

export default function App() {
  const root = document.getElementById('root')!;

  const list = document.createElement('ul');
  list.className = 'list';
  root.appendChild(list);

  const manager = new DragDropManager();
  const items = Array.from({length: 100}, (_, i) => i + 1);

  for (const id of items) {
    const li = document.createElement('li');
    li.className = 'item';
    li.textContent = String(id);

    const handle = document.createElement('button');
    handle.className = 'handle';
    li.appendChild(handle);

    list.appendChild(li);

    new Sortable({
      id,
      element: li,
      handle,
      index: id - 1,
      effects: () => [
        (sortable) => {
          if (sortable.isDragging) {
            li.dataset.shadow = '';
            return () => delete li.dataset.shadow;
          }
        },
      ],
    }, manager);
  }
}
