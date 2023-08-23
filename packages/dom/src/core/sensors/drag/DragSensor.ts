import {Sensor} from '@dnd-kit/abstract';
import {effect} from '@dnd-kit/state';
import type {CleanupFunction} from '@dnd-kit/state';
import {Listeners} from '@dnd-kit/dom/utilities';

import type {DragDropManager} from '../../manager/index.js';
import type {Draggable} from '../../entities/index.js';

import {encode, decode} from './encoding.js';

interface DragSensorOptions {}

/**
 * The DragSensor class is a Sensor that handles native HTML drag and drop events
 */
export class DragSensor extends Sensor<DragDropManager, DragSensorOptions> {
  private listeners = new Listeners();
  private unbind: CleanupFunction | undefined;

  constructor(
    public manager: DragDropManager,
    public options: DragSensorOptions
  ) {
    super(manager);

    this.listeners.bind(document, [
      {type: 'dragenter', listener: this.handleDragEnter.bind(this)},
      {type: 'dragleave', listener: this.handleDragLeave.bind(this)},
    ]);
  }

  public bind(source: Draggable, options: DragSensorOptions) {
    const unbind = effect(() => {
      const target = source.activator ?? source.element;
      const listener: EventListener = (event: Event) => {
        if (event instanceof DragEvent) {
          this.handleDragStart(event, source, options);
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
    _options: DragSensorOptions
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

    this.manager.actions.setDragSource(source.id);

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
        listener: this.handlePointerMove.bind(this),
      },
      {
        type: 'dragover',
        listener: this.handleDragOver.bind(this),
      },
      {
        type: 'dragend',
        listener: this.handlePointerUp.bind(this),
      },
    ]);
  };

  private handleDragEnter(event: DragEvent) {
    if (this.disabled || event.relatedTarget) {
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
  }

  private handleDragLeave(event: DragEvent) {
    if (event.relatedTarget) {
      return;
    }
  }

  private handleDragOver(event: DragEvent) {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  private handlePointerMove(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this.manager.dragOperation.status.idle) {
      this.manager.actions.start({
        event,
        coordinates: {
          x: event.clientX,
          y: event.clientY,
        },
      });
      return;
    }

    this.manager.actions.move({
      to: {
        x: event.clientX,
        y: event.clientY,
      },
    });
  }

  private handlePointerUp(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.manager.actions.stop();
    this.unbind?.();
  }

  public destroy() {
    this.listeners.clear();
  }
}
