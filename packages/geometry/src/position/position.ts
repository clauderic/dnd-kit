import {batch, derived, reactive, ValueHistory} from '@dnd-kit/state';

import {Point} from '../point';
import type {Coordinates} from '../types';

export class Position extends ValueHistory<Point> {
  constructor(initialValue: Coordinates) {
    const point = Point.from(initialValue);

    super(point, (a, b) => Point.equals(a, b));
  }

  #timestamp = 0;

  @reactive
  // @ts-ignore
  public accessor velocity: Point;

  @derived
  public get delta() {
    return Point.delta(this.current, this.initial);
  }

  @derived
  public get direction() {
    const {current, previous} = this;

    if (!previous) return null;

    const delta = {
      x: current.x - previous.x,
      y: current.y - previous.y,
    };

    if (!delta.x && !delta.y) {
      return null;
    }

    if (Math.abs(delta.x) > Math.abs(delta.y)) {
      return delta.x > 0 ? 'right' : 'left';
    }

    return delta.y > 0 ? 'down' : 'up';
  }

  public get current() {
    return super.current;
  }

  public set current(coordinates: Coordinates) {
    const {current} = this;
    const point = Point.from(coordinates);

    const delta = {
      x: point.x - current.x,
      y: point.y - current.y,
    };
    const timestamp = Date.now();
    const timeDelta = timestamp - this.#timestamp;
    const velocity = (delta: number) => Math.round((delta / timeDelta) * 100);

    batch(() => {
      this.#timestamp = timestamp;
      this.velocity = {
        x: velocity(delta.x),
        y: velocity(delta.y),
      };
      super.current = point;
    });
  }

  public reset(coordinates = this.defaultValue) {
    batch(() => {
      super.reset(Point.from(coordinates));
      this.velocity = {x: 0, y: 0};
    });
  }
}
