import type {DragDropManager} from '../../manager';

export class PointerSensor {
  constructor(private manager: DragDropManager) {
    this.manager = manager;

    document.addEventListener('pointerdown', this.handlePointerDown, {
      capture: true,
    });
  }

  handlePointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    if (!(event.target instanceof Element)) {
      return;
    }

    const {registry} = this.manager;

    for (const node of registry.draggable) {
      const element = node.activator ?? node.element;

      if (
        element &&
        (element === event.target || element.contains(event.target))
      ) {
        this.manager.actions.start(['test-1', 'test-2'], {
          x: event.clientX,
          y: event.clientY,
        });

        event.preventDefault();
        event.stopPropagation();

        document.addEventListener('pointermove', this.handlePointerMove);
        document.addEventListener('pointerup', this.handlePointerUp);
        break;
      }
    }
  };

  handlePointerMove = (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();

    this.manager.actions.move({
      x: event.clientX,
      y: event.clientY,
    });
  };

  handlePointerUp = (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();

    this.manager.actions.stop();

    document.removeEventListener('pointermove', this.handlePointerMove);
    document.removeEventListener('pointerup', this.handlePointerUp);
  };
}
