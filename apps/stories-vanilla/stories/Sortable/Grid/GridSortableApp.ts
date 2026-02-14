import {DragDropManager} from '@dnd-kit/dom';
import {Sortable} from '@dnd-kit/dom/sortable';

export default function App() {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'grid';
  wrapper.style.gridTemplateColumns = 'repeat(auto-fill, 150px)';
  wrapper.style.gridAutoRows = '150px';
  wrapper.style.gridAutoFlow = 'dense';
  wrapper.style.gap = '18px';
  wrapper.style.padding = '0 30px';
  wrapper.style.maxWidth = '900px';
  wrapper.style.marginInline = 'auto';
  wrapper.style.justifyContent = 'center';

  const manager = new DragDropManager();
  const items = createRange(20);

  for (const id of items) {
    const element = document.createElement('div');
    element.classList.add('item');
    element.textContent = String(id);
    element.style.height = '100%';
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
