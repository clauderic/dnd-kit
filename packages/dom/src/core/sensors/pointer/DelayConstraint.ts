import {ActivationConstraint} from '@dnd-kit/abstract';
import {
  exceedsDistance,
  type Distance,
  type Coordinates,
} from '@dnd-kit/geometry';
import {getEventCoordinates} from '@dnd-kit/dom/utilities';

export interface DelayConstraintOptions {
  value: number;
  tolerance: Distance;
}

export class DelayConstraint extends ActivationConstraint<
  PointerEvent,
  DelayConstraintOptions
> {
  #timeout?: ReturnType<typeof setTimeout>;
  #coordinates?: Coordinates;

  onEvent(event: PointerEvent) {
    switch (event.type) {
      case 'pointerdown':
        this.#coordinates = getEventCoordinates(event);
        this.#timeout = setTimeout(
          () => this.activate(event),
          this.options.value
        );
        break;
      case 'pointermove':
        if (!this.#coordinates) return;

        const {x, y} = getEventCoordinates(event);
        const delta = {
          x: x - this.#coordinates.x,
          y: y - this.#coordinates.y,
        };

        if (exceedsDistance(delta, this.options.tolerance)) {
          this.abort(event);
        }
        break;
      case 'pointerup':
        this.abort(event);
        break;
    }
  }

  abort(event?: PointerEvent) {
    super.abort(event);

    if (this.#timeout) {
      clearTimeout(this.#timeout);
      this.#coordinates = undefined;
      this.#timeout = undefined;
    }
  }
}
