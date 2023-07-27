import {effect} from '@dnd-kit/state';
import {Listeners} from '@dnd-kit/dom-utilities';
import type {CleanupFunction} from '@dnd-kit/types';

import type {DragDropManager} from '../../manager';
import type {Draggable} from '../../nodes';
import type {DOMSensor} from '../types';

import {encode, decode} from './encoding';

interface DragSensorOptions {}

/**
 * The DragSensor class is a DOMSensor that handles HTML drag and drop events
 */
export class DragSensor {
  // implements DOMSensor<DragSensorOptions> {
  private listeners = new Listeners();
  private unbind: CleanupFunction | undefined;

  constructor(options: DragSensorOptions) {
    this.listeners.bind(document, [
      {type: 'dragenter', listener: this.handleDragEnter},
      {type: 'dragleave', listener: this.handleDragLeave},
    ]);
  }

  public bind(source: Draggable, manager: DragDropManager) {
    const unbind = effect(() => {
      const target = source.activator ?? source.element;
      const listener: EventListener = (event: Event) => {
        if (event instanceof DragEvent) {
          this.handleDragStart(event, source, manager);
        }
      };

      if (target) {
        target.addEventListener('dragstart', listener);

        return () => {
          target.removeEventListener('dragstart', listener);
        };
      }
    });

    return unbind;
  }

  private handleDragStart = (
    event: DragEvent,
    source: Draggable,
    manager: DragDropManager
  ) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (source.disabled === true) {
      return;
    }

    const element = source.activator ?? source.element;

    if (!element) {
      return;
    }

    manager.actions.setDragSource(source.id);

    event.stopImmediatePropagation();

    event.dataTransfer?.clearData();

    const {width, height} = element.getBoundingClientRect();

    const data = encode({
      id: source.id,
      type: source.type,
      rect: {width, height},
    });

    event.dataTransfer?.setData(`application/dnd-kit;${data}`, ' ');

    this.unbind = this.listeners.bind(document, [
      {
        type: 'drag',
        listener: (event: DragEvent) => this.handlePointerMove(event, manager),
      },
      {
        type: 'dragover',
        listener: (event: DragEvent) => this.handleDragOver(event, manager),
      },
      {
        type: 'dragend',
        listener: (event: DragEvent) => this.handlePointerUp(event, manager),
      },
    ]);
  };

  private handleDragEnter = (event: DragEvent) => {
    if (event.relatedTarget) {
      return;
    }

    const data = event.dataTransfer?.types;
    const type = data?.find((type) => type.startsWith('application/dnd-kit;'));

    if (type) {
      const [_, encoded] = type.split(';');

      try {
        const decoded = decode(encoded);

        console.log(encoded, decoded);
      } catch {
        // no-op
      }
    }
  };

  private handleDragLeave = (event: DragEvent) => {
    if (event.relatedTarget) {
      return;
    }
  };

  private handleDragOver = (event: DragEvent, manager: DragDropManager) => {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  };

  private handlePointerMove = (event: DragEvent, manager: DragDropManager) => {
    event.preventDefault();
    event.stopPropagation();

    if (manager.dragOperation.status === 'idle') {
      manager.actions.start({
        x: event.clientX,
        y: event.clientY,
      });
      return;
    }

    manager.actions.move({
      x: event.clientX,
      y: event.clientY,
    });
  };

  private handlePointerUp = (event: DragEvent, manager: DragDropManager) => {
    event.preventDefault();
    event.stopPropagation();

    manager.actions.stop();
    this.unbind?.();
  };

  public destroy() {
    this.listeners.clear();
  }
}
