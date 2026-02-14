import {DragDropManager} from '@dnd-kit/dom';
import {Sortable} from '@dnd-kit/dom/sortable';

export default function App() {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'inline-flex';
  wrapper.style.flexDirection = 'row';
  wrapper.style.alignItems = 'stretch';
  wrapper.style.height = '180px';
  wrapper.style.gap = '18px';
  wrapper.style.padding = '0 30px';

  const manager = new DragDropManager();
  const items = createRange(10);

  for (const id of items) {
    const element = document.createElement('div');
    element.classList.add('item');
    element.textContent = String(id);
    element.style.aspectRatio = '1';
    element.style.justifyContent = 'center';

    wrapper.appendChild(element);

    const sortable = new Sortable(
      {
        id,
        element,
        index: id - 1,
        effects: () => [
          () => {
            if (sortable.isDragging) {
              element.dataset.shadow = '';
              return () => delete element.dataset.shadow;
            }
          },
        ],
      },
      manager
    );
  }

  return wrapper;
}

function createRange(length: number) {
  return Array.from({length}, (_, i) => i + 1);
}
