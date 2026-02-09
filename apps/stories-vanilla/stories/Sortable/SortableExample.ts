import {DragDropManager} from '@dnd-kit/dom';
import {Sortable} from '@dnd-kit/dom/sortable';

interface SortableExampleOptions {
  layout?: 'vertical' | 'horizontal' | 'grid';
  itemCount?: number;
}

export function SortableExample({
  layout = 'vertical',
  itemCount = 15,
}: SortableExampleOptions = {}) {
  const root = createWrapperElement(layout);

  const manager = new DragDropManager();
  const items = Array.from({length: itemCount}, (_, index) => index);

  for (const item of items) {
    const element = document.createElement('div');
    element.classList.add('Item');
    element.textContent = item.toString();

    if (layout === 'horizontal') {
      element.style.minWidth = '100px';
      element.style.justifyContent = 'center';
    }

    if (layout === 'grid') {
      element.style.height = '100%';
      element.style.justifyContent = 'center';
    }

    root.append(element);

    const sortable = new Sortable(
      {
        id: item,
        element,
        index: item,
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
  }

  return {root, cleanup: () => { manager.destroy(); }};
}

function createWrapperElement(layout: string) {
  const wrapper = document.createElement('div');

  wrapper.style.setProperty('display', layout === 'grid' ? 'grid' : 'flex');
  wrapper.style.setProperty('gap', layout === 'grid' ? '18px' : '15px');
  wrapper.style.setProperty('padding', '0 30px');

  switch (layout) {
    case 'horizontal':
      wrapper.style.setProperty('flex-direction', 'row');
      wrapper.style.setProperty('align-items', 'stretch');
      wrapper.style.setProperty('height', '180px');
      break;
    case 'grid':
      wrapper.style.setProperty('max-width', '900px');
      wrapper.style.setProperty('margin-inline', 'auto');
      wrapper.style.setProperty('grid-template-columns', 'repeat(auto-fill, 150px)');
      wrapper.style.setProperty('grid-auto-flow', 'dense');
      wrapper.style.setProperty('grid-auto-rows', '150px');
      wrapper.style.setProperty('justify-content', 'center');
      break;
    case 'vertical':
    default:
      wrapper.style.setProperty('flex-direction', 'column');
      wrapper.style.setProperty('align-items', 'center');
      break;
  }

  return wrapper;
}
