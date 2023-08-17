import {effect} from '@dnd-kit/state';
import {Plugin} from '@dnd-kit/abstract';
import type {UniqueIdentifier} from '@dnd-kit/abstract';

import {DragDropManager} from '../../manager';

export class Debug extends Plugin<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);

    const elements = new Map<UniqueIdentifier, HTMLElement>();
    let draggableElement: HTMLElement | null = null;

    this.destroy = effect(() => {
      const {dragOperation} = manager;
      const {dragging} = dragOperation.status;

      if (!dragging) {
        draggableElement?.remove();
        draggableElement = null;

        for (const element of elements.values()) {
          element.remove();
        }

        elements.clear();
        return;
      }

      const draggable = dragOperation.source;

      if (draggable && dragOperation.shape) {
        const element = draggableElement ?? document.createElement('dialog');
        const {boundingRectangle} = dragOperation.shape;

        if (!draggableElement) {
          draggableElement = element;

          const style = document.createElement('style');
          style.innerText = `dialog[data-dnd-kit-debug]::backdrop {display: none;}`;

          element.innerText = `${draggable.id}`;
          element.setAttribute('data-dnd-kit-debug', '');
          element.appendChild(style);
          element.style.all = 'initial';
          element.style.position = 'fixed';
          element.style.display = 'flex';
          element.style.alignItems = 'center';
          element.style.justifyContent = 'center';
          element.style.backgroundColor = 'rgba(118, 190, 250, 0.5)';
          element.style.border = '1px solid rgba(0, 0, 0, 0.1)';
          element.style.boxSizing = 'border-box';
          element.style.pointerEvents = 'none';
          element.style.color = 'rgba(0,0,0,0.9)';
          element.style.textShadow = '0 0 3px rgba(255,255,255,0.8)';
          element.style.fontFamily = 'sans-serif';

          document.body.appendChild(element);

          if (element instanceof HTMLDialogElement) {
            element.showModal();
          }
        }

        element.style.top = `${boundingRectangle.top}px`;
        element.style.left = `${boundingRectangle.left}px`;
        element.style.width = `${boundingRectangle.width}px`;
        element.style.height = `${boundingRectangle.height}px`;
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
          const debugElement = element ?? document.createElement('div');

          if (!element) {
            elements.set(droppable.id, debugElement);
            debugElement.style.position = 'fixed';
            debugElement.style.display = 'flex';
            debugElement.style.alignItems = 'center';
            debugElement.style.justifyContent = 'center';
            debugElement.style.border = '1px solid rgba(0, 0, 0, 0.1)';
            debugElement.style.boxSizing = 'border-box';
            debugElement.style.pointerEvents = 'none';
            debugElement.style.zIndex = '9999';
            debugElement.style.color = 'rgba(0,0,0,0.5)';
            debugElement.style.fontFamily = 'sans-serif';
            document.body.appendChild(debugElement);
          }

          debugElement.style.backgroundColor = droppable.isDropTarget
            ? 'rgba(13, 210, 36, 0.6)'
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
