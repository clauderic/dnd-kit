import {DragDropManager, PointerSensor, KeyboardSensor} from '@dnd-kit/dom';
import {Sortable} from '@dnd-kit/dom/sortable';
import {move} from '@dnd-kit/helpers';

import {createRange} from '@dnd-kit/stories-shared/utilities';

const COLORS: Record<string, string> = {
  A: '#7193f1',
  B: '#FF851B',
  C: '#2ECC40',
  D: '#ff3680',
};

export function MultipleListsExample(itemCount = 5) {
  const root = document.createElement('div');
  root.style.setProperty('display', 'flex');
  root.style.setProperty('flex-direction', 'row');
  root.style.setProperty('gap', '20px');

  const manager = new DragDropManager({
    sensors: [
      PointerSensor.configure({
        activatorElements(source) {
          return [source.element, source.handle];
        },
      }),
      KeyboardSensor,
    ],
  });

  let items: Record<string, string[]> = {
    A: createRange(itemCount).map((id) => `A${id}`),
    B: createRange(itemCount).map((id) => `B${id}`),
    C: createRange(itemCount).map((id) => `C${id}`),
    D: [],
  };

  const columns = Object.keys(items);
  const columnElements: Record<string, HTMLElement> = {};
  const sortables: Sortable[] = [];

  for (const [columnIndex, column] of columns.entries()) {
    const containerEl = createContainerElement(column);
    root.append(containerEl);
    columnElements[column] = containerEl.querySelector('ul')!;

    const columnSortable = new Sortable(
      {
        id: column,
        element: containerEl,
        accept: ['column', 'item'],
        type: 'column',
        index: columnIndex,
        handle: containerEl.querySelector('handle-component') ?? undefined,
      },
      manager
    );
    sortables.push(columnSortable);

    renderItems(column);
  }

  function renderItems(column: string) {
    const listEl = columnElements[column];
    listEl.innerHTML = '';

    for (const [index, itemId] of items[column].entries()) {
      const element = document.createElement('div');
      element.classList.add('Item');
      element.textContent = itemId;
      element.style.setProperty('--accent-color', COLORS[column]);
      element.setAttribute('data-accent-color', column);
      listEl.append(element);

      const sortable = new Sortable(
        {
          id: itemId,
          element,
          group: column,
          accept: 'item',
          type: 'item',
          feedback: 'clone',
          index,
          data: {group: column},
          effects: () => [
            () => {
              if (sortable.isDragging) {
                element.setAttribute('data-shadow', 'true');
                return () => element.removeAttribute('data-shadow');
              }
            },
          ],
        },
        manager
      );
      sortables.push(sortable);
    }
  }

  manager.monitor.addEventListener('dragover', (event) => {
    const {source} = event.operation;

    if (source?.type === 'column') {
      return;
    }

    items = move(items, event);
    rerenderAll();
  });

  manager.monitor.addEventListener('dragend', (event) => {
    if (event.canceled) {
      return;
    }
  });

  function rerenderAll() {
    // Destroy existing item sortables (keep column sortables)
    for (const sortable of sortables.slice(columns.length)) {
      sortable.destroy();
    }
    sortables.length = columns.length;

    for (const column of columns) {
      renderItems(column);
    }
  }

  return {
    root,
    cleanup: () => {
      for (const sortable of sortables) {
        sortable.destroy();
      }
      manager.destroy();
    },
  };
}

function createContainerElement(label: string) {
  const container = document.createElement('container-component');

  const header = document.createElement('div');
  header.className = 'Header';
  header.textContent = label;

  const handle = document.createElement('handle-component');
  header.appendChild(handle);

  const list = document.createElement('ul');
  list.style.setProperty('list-style', 'none');
  list.style.setProperty('padding', '15px');
  list.style.setProperty('margin', '0');
  list.style.setProperty('display', 'grid');
  list.style.setProperty('gap', '16px');

  container.append(header, list);

  return container;
}
