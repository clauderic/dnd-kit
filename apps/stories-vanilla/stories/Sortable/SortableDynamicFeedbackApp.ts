import {DragDropManager, Feedback} from '@dnd-kit/dom';
import {Sortable} from '@dnd-kit/dom/sortable';

const dynamicFeedbackPlugin = Feedback.configure({
  feedback: (_source, manager) =>
    manager.dragOperation.activatorEvent instanceof KeyboardEvent
      ? 'clone'
      : 'default',
});

export default function App() {
  const list = document.createElement('ul');
  list.className = 'list';

  const manager = new DragDropManager();
  const items = createRange(100);

  for (const id of items) {
    const li = document.createElement('li');
    li.className = 'item';
    li.textContent = String(id);

    list.appendChild(li);

    const sortable = new Sortable(
      {
        id,
        element: li,
        index: id - 1,
        plugins: [dynamicFeedbackPlugin],
        effects: () => [
          () => {
            if (sortable.isDragging) {
              li.dataset.shadow = '';
              return () => delete li.dataset.shadow;
            }
          },
        ],
      },
      manager
    );
  }

  return list;
}

function createRange(length: number) {
  return Array.from({length}, (_, i) => i + 1);
}
