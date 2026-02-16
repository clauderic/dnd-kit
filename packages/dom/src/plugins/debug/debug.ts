import {effects} from '@dnd-kit/state';
import {Plugin} from '@dnd-kit/abstract';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import type {DragDropManager} from '@dnd-kit/dom';
import {showPopover, hidePopover, getFixedPositionOffset} from '@dnd-kit/dom/utilities';

export class Debug extends Plugin<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);

    const elements = new Map<UniqueIdentifier, HTMLElement>();
    let draggableElement: HTMLElement | null = null;
    let positionElement: HTMLElement | null = null;

    const cleanup = effects(() => {
      const {dragOperation} = manager;
      const {x, y} = dragOperation.position.current;
      const {current: _, idle} = dragOperation.status;
      const {collisions} = manager.collisionObserver;
      const draggable = dragOperation.source;
      const topCollisions = collisions.slice(1, 3);
      const collidingIds = topCollisions.map(({id}) => id);

      if (draggable && dragOperation.shape) {
        const element = draggableElement ?? createDebugElement();
        const {boundingRectangle} = dragOperation.shape.current;

        if (!draggableElement) {
          draggableElement = element;

          const style = document.createElement('style');
          style.textContent = `dialog[data-dnd-kit-debug]::backdrop {display: none;}`;

          element.textContent = `${draggable.id}`;
          element.setAttribute('data-dnd-kit-debug', '');
          element.appendChild(style);
          element.style.backgroundColor = 'rgba(118, 190, 250, 0.5)';
          element.style.color = 'rgba(0,0,0,0.9)';

          document.body.appendChild(element);
        }

        const draggableOffset = getFixedPositionOffset();
        element.style.top = `${boundingRectangle.top + draggableOffset.y}px`;
        element.style.left = `${boundingRectangle.left + draggableOffset.x}px`;
        element.style.width = `${boundingRectangle.width}px`;
        element.style.height = `${boundingRectangle.height}px`;

        hidePopover(element);
        showPopover(element);
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

          const droppableOffset = getFixedPositionOffset();
          debugElement.style.top = `${boundingRectangle.top + droppableOffset.y}px`;
          debugElement.style.left = `${boundingRectangle.left + droppableOffset.x}px`;
          debugElement.style.width = `${boundingRectangle.width}px`;
          debugElement.style.height = `${boundingRectangle.height}px`;
          debugElement.textContent = `${droppable.id}`;
        } else if (element) {
          element.remove();
          elements.delete(droppable.id);
        }
      }

      if (!idle) {
        if (!positionElement) {
          positionElement = createDebugElement();

          const horizontal = document.createElement('div');
          const vertical = document.createElement('div');

          horizontal.style.position = 'absolute';
          horizontal.style.width = '25px';
          horizontal.style.height = '1px';
          horizontal.style.backgroundColor = '#000';

          vertical.style.position = 'absolute';
          vertical.style.width = '1px';
          vertical.style.height = '25px';
          vertical.style.backgroundColor = '#000';

          positionElement.appendChild(horizontal);
          positionElement.appendChild(vertical);
          document.body.appendChild(positionElement);
        }

        const posOffset = getFixedPositionOffset();
        positionElement.style.top = `${y + posOffset.y}px`;
        positionElement.style.left = `${x + posOffset.x}px`;

        hidePopover(positionElement);
        // Only one element can be promoted to the top layer per call stack
        queueMicrotask(() => positionElement && showPopover(positionElement));
      } else {
        positionElement?.remove();
        positionElement = null;
      }
    });

    this.destroy = () => {
      positionElement?.remove();
      draggableElement?.remove();
      elements.forEach((element) => element.remove());
      cleanup();
    };
  }
}

function createDebugElement(tagName = 'div') {
  const element = document.createElement(tagName);

  element.setAttribute('popover', 'manual');
  element.style.all = 'initial';
  element.style.position = 'fixed';
  element.style.display = 'flex';
  element.style.alignItems = 'center';
  element.style.justifyContent = 'center';
  element.style.border = '1px solid rgba(0, 0, 0, 0.1)';
  element.style.boxSizing = 'border-box';
  element.style.pointerEvents = 'none';
  element.style.zIndex = 'calc(infinity)';
  element.style.color = 'rgba(0,0,0,0.5)';
  element.style.fontFamily = 'sans-serif';
  element.style.textShadow = '0 0 3px rgba(255,255,255,0.8)';
  element.style.pointerEvents = 'none';

  return element;
}
