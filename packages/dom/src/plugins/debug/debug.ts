import {effect} from '@dnd-kit/state';
import {Plugin} from '@dnd-kit/abstract';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import type {DragDropManager} from '@dnd-kit/dom';

export class Debug extends Plugin<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);

    if (process.env.NODE_ENV !== 'production') {
      const elements = new Map<UniqueIdentifier, HTMLElement>();
      let draggableElement: HTMLElement | null = null;

      this.destroy = effect(() => {
        const {dragOperation} = manager;
        const {current: _} = dragOperation.status;

        const {collisions} = manager.collisionObserver;
        const draggable = dragOperation.source;
        const topCollisions = collisions.slice(1, 3);
        const collidingIds = topCollisions.map(({id}) => id);

        if (draggable && dragOperation.shape) {
          const element = draggableElement ?? createDebugElement('dialog');
          const {boundingRectangle} = dragOperation.shape.current;

          if (!draggableElement) {
            draggableElement = element;

            const style = document.createElement('style');
            style.innerText = `dialog[data-dnd-kit-debug]::backdrop {display: none;}`;

            element.innerText = `${draggable.id}`;
            element.setAttribute('data-dnd-kit-debug', '');
            element.appendChild(style);
            element.style.backgroundColor = 'rgba(118, 190, 250, 0.5)';
            element.style.color = 'rgba(0,0,0,0.9)';

            document.body.appendChild(element);

            if (element instanceof HTMLDialogElement) {
              element.showModal();
            }
          }

          element.style.top = `${boundingRectangle.top}px`;
          element.style.left = `${boundingRectangle.left}px`;
          element.style.width = `${boundingRectangle.width}px`;
          element.style.height = `${boundingRectangle.height}px`;
        } else {
          draggableElement?.remove();
          draggableElement = null;
        }

        for (const [id, element] of elements) {
          if (!manager.registry.droppables.has(id)) {
            element.remove();
            elements.delete(id);
          }
        }

        for (const droppable of manager.registry.droppables) {
          const element = elements.get(droppable.id);

          if (droppable.shape) {
            const {boundingRectangle} = droppable.shape;
            const debugElement = element ?? createDebugElement();

            if (!element) {
              elements.set(droppable.id, debugElement);
              document.body.appendChild(debugElement);
            }

            debugElement.style.backgroundColor = droppable.isDropTarget
              ? 'rgba(13, 210, 36, 0.6)'
              : collidingIds.includes(droppable.id)
              ? 'rgba(255, 193, 7, 0.5)'
              : 'rgba(0, 0, 0, 0.1)';

            debugElement.style.top = `${boundingRectangle.top}px`;
            debugElement.style.left = `${boundingRectangle.left}px`;
            debugElement.style.width = `${boundingRectangle.width}px`;
            debugElement.style.height = `${boundingRectangle.height}px`;
            debugElement.innerText = `${droppable.id}`;
          } else if (element) {
            element.remove();
            elements.delete(droppable.id);
          }
        }
      });
    }
  }
}

function createDebugElement(tagName = 'div') {
  const element = document.createElement(tagName);

  element.style.all = 'initial';
  element.style.position = 'fixed';
  element.style.display = 'flex';
  element.style.alignItems = 'center';
  element.style.justifyContent = 'center';
  element.style.border = '1px solid rgba(0, 0, 0, 0.1)';
  element.style.boxSizing = 'border-box';
  element.style.pointerEvents = 'none';
  element.style.zIndex = '9999';
  element.style.color = 'rgba(0,0,0,0.5)';
  element.style.fontFamily = 'sans-serif';
  element.style.textShadow = '0 0 3px rgba(255,255,255,0.8)';
  element.style.pointerEvents = 'none';

  return element;
}
