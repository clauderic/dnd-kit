import {DragDropManager, PointerSensor, KeyboardSensor} from '@dnd-kit/dom';
import {Sortable} from '@dnd-kit/dom/sortable';
import {move} from '@dnd-kit/helpers';
import {batch} from '@dnd-kit/state';

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
  const itemSortables = new Map<string, Sortable>();
  const allSortables: Sortable[] = [];

  // Create columns
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
    allSortables.push(columnSortable);
  }

  // Create items
  for (const column of columns) {
    for (const [index, itemId] of items[column].entries()) {
      createItem(itemId, column, index);
    }
  }

  function createItem(itemId: string, column: string, index: number) {
    const element = document.createElement('div');
    element.classList.add('Item');
    element.textContent = itemId;
    element.style.setProperty('--accent-color', COLORS[column]);
    element.setAttribute('data-accent-color', column);
    columnElements[column].append(element);

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

    itemSortables.set(itemId, sortable);
    allSortables.push(sortable);
  }

  // Find which column an item belongs to
  function findColumn(itemId: string): string | undefined {
    for (const [column, columnItems] of Object.entries(items)) {
      if (columnItems.includes(itemId)) return column;
    }
    return undefined;
  }

  manager.monitor.addEventListener('dragover', (event) => {
    const {source} = event.operation;

    if (source?.type === 'column') {
      // Optimistic sorting handles column reordering
      return;
    }

    const prevItems = items;
    items = move(items, event);

    // Find items that changed columns and update accordingly
    for (const column of columns) {
      for (const [index, itemId] of items[column].entries()) {
        const sortable = itemSortables.get(itemId);
        if (!sortable) continue;

        const prevColumn = findColumnIn(prevItems, itemId);
        const movedColumns = prevColumn !== column;

        if (movedColumns) {
          // Move the DOM element to the new column
          const targetList = columnElements[column];
          const element = sortable.element;

          if (element) {
            // Insert at the correct position
            const referenceNode = targetList.children[index];
            if (referenceNode) {
              targetList.insertBefore(element, referenceNode);
            } else {
              targetList.appendChild(element);
            }

            // Update accent color
            (element as HTMLElement).style.setProperty(
              '--accent-color',
              COLORS[column]
            );
            element.setAttribute('data-accent-color', column);
          }
        }

        // Update the sortable's group and index
        batch(() => {
          sortable.group = column;
          sortable.index = index;
        });
        sortable.data = {group: column};
      }
    }
  });

  manager.monitor.addEventListener('dragend', (event) => {
    if (event.canceled) {
      return;
    }
  });

  return {
    root,
    cleanup: () => {
      for (const sortable of allSortables) {
        sortable.destroy();
      }
      manager.destroy();
    },
  };
}

function findColumnIn(
  items: Record<string, string[]>,
  itemId: string
): string | undefined {
  for (const [column, columnItems] of Object.entries(items)) {
    if (columnItems.includes(itemId)) return column;
  }
  return undefined;
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
