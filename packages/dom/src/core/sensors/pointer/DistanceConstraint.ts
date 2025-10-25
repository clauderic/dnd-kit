import {ActivationConstraint} from '@dnd-kit/abstract';
import {
  exceedsDistance,
  type Distance,
  type Coordinates,
} from '@dnd-kit/geometry';
import {getEventCoordinates} from '@dnd-kit/dom/utilities';

export interface DistanceConstraintOptions {
  value: number;
  tolerance?: Distance;
}

export class DistanceConstraint extends ActivationConstraint<
  PointerEvent,
  DistanceConstraintOptions
> {
  #coordinates?: Coordinates;

  onEvent(event: PointerEvent) {
    switch (event.type) {
      case 'pointerdown':
        this.#coordinates = getEventCoordinates(event);
        break;
      case 'pointermove':
        if (!this.#coordinates) return;

        const {x, y} = getEventCoordinates(event);
        const delta = {
          x: x - this.#coordinates.x,
          y: y - this.#coordinates.y,
        };

        const {tolerance} = this.options;

        if (tolerance && exceedsDistance(delta, tolerance)) {
          this.abort();
          return;
        }

        if (exceedsDistance(delta, this.options.value)) {
          this.activate(event);
        }
        break;
      case 'pointerup':
        this.abort();
        break;
    }
  }

  abort() {
    this.#coordinates = undefined;
  }
}
