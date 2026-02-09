import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropManager, PointerSensor, KeyboardSensor} from '@dnd-kit/dom';
import {Sortable} from '@dnd-kit/dom/sortable';
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

  let items: Record<string, UniqueIdentifier[]> = {
    A: createRange(itemCount).map((id) => `A${id}`),
    B: createRange(itemCount).map((id) => `B${id}`),
    C: createRange(itemCount).map((id) => `C${id}`),
    D: [],
  };

  const columns = Object.keys(items);
  const columnElements: Record<string, HTMLElement> = {};
  const itemSortables = new Map<UniqueIdentifier, Sortable>();
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

  function createItem(itemId: UniqueIdentifier, column: string, index: number) {
    const element = document.createElement('div');
    element.classList.add('Item');
    element.textContent = `${itemId}`;
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

  function moveItemToColumn(
    sortable: Sortable,
    targetColumn: string,
    index: number
  ) {
    const element = sortable.element;
    if (!element) return;

    const targetList = columnElements[targetColumn];
    const referenceNode = targetList.children[index];

    if (referenceNode) {
      targetList.insertBefore(element, referenceNode);
    } else {
      targetList.appendChild(element);
    }

    (element as HTMLElement).style.setProperty(
      '--accent-color',
      COLORS[targetColumn]
    );
    element.setAttribute('data-accent-color', targetColumn);

    batch(() => {
      sortable.group = targetColumn;
      sortable.index = index;
    });
    sortable.data = {group: targetColumn};
  }

  manager.monitor.addEventListener('dragover', (event) => {
    const {source, target} = event.operation;

    if (!source || !target) return;

    // Optimistic sorting handles column reordering
    if (source.type === 'column') return;

    // Optimistic sorting handles within-column reordering
    const sourceColumn = source.group ?? findColumn(source.id);
    const targetColumn =
      target.type === 'column' ? `${target.id}` : target.group;

    if (sourceColumn === targetColumn) return;

    // Item dragged onto an empty column
    if (source.type === 'item' && target.type === 'column') {
      const sortable = itemSortables.get(source.id);
      if (!sortable) return;

      moveItemToColumn(sortable, `${target.id}`, 0);
    }
  });

  manager.monitor.addEventListener('dragend', (event) => {
    if (event.canceled) return;

    // Reconcile local state from the sortable instances
    const newItems: Record<string, UniqueIdentifier[]> = {};
    for (const column of columns) {
      newItems[column] = [];
    }

    for (const [itemId, sortable] of itemSortables) {
      const column = `${sortable.group}`;
      if (newItems[column]) {
        newItems[column].push(itemId);
      }
    }

    // Sort by index within each column
    for (const column of columns) {
      newItems[column].sort((a, b) => {
        const sa = itemSortables.get(a)!;
        const sb = itemSortables.get(b)!;
        return sa.index - sb.index;
      });
    }

    items = newItems;

    // Move DOM elements to match final positions
    for (const column of columns) {
      const listEl = columnElements[column];

      for (const itemId of items[column]) {
        const sortable = itemSortables.get(itemId);
        const element = sortable?.element;
        if (!element) continue;

        listEl.appendChild(element);

        (element as HTMLElement).style.setProperty(
          '--accent-color',
          COLORS[column]
        );
        element.setAttribute('data-accent-color', column);
      }
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

function findColumn(
  itemId: UniqueIdentifier
): string | undefined {
  // This is a fallback; prefer reading from sortable.group directly
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
