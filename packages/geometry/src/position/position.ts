import {batch, derived, reactive} from '@dnd-kit/state';

import {Point} from '../point';
import type {Coordinates} from '../types';

const SENSITIVITY = 10;

export class Position {
  constructor(initialValue: Coordinates) {
    const point = Point.from(initialValue);

    this.initial = point;
    this.current = point;
    this.previous = point;
  }

  #timestamp = 0;

  @reactive
  public accessor velocity: Point = {
    x: 0,
    y: 0,
  };

  @reactive
  public accessor initial: Point;

  @reactive
  public accessor previous: Point;

  @reactive
  public accessor current: Point;

  @derived
  public get delta() {
    return Point.delta(this.current, this.initial);
  }

  @derived
  public get direction() {
    const delta = {
      x: this.current.x - this.previous.x,
      y: this.current.y - this.previous.y,
    };

    if (!delta.x && !delta.y) {
      return null;
    }

    if (Math.abs(delta.x) > Math.abs(delta.y)) {
      return delta.x > 0 ? 'right' : 'left';
    }

    return delta.y > 0 ? 'down' : 'up';
  }

  public reset(coordinates: Coordinates) {
    const point = Point.from(coordinates);

    batch(() => {
      this.#timestamp = 0;
      this.velocity = {x: 0, y: 0};
      this.current = point;
      this.previous = point;
      this.initial = point;
    });
  }

  public update(coordinates: Coordinates) {
    const {current} = this;
    const point = Point.from(coordinates);

    if (Point.equals(current, point)) {
      return;
    }

    const delta = {
      x: point.x - current.x,
      y: point.y - current.y,
    };
    const timestamp = Date.now();
    const timeDelta = timestamp - this.#timestamp;
    const velocity = (delta: number) => Math.round((delta / timeDelta) * 100);

    if (Math.abs(delta.x) < SENSITIVITY || Math.abs(delta.y) < SENSITIVITY) {
      this.previous = current;
    }

    this.#timestamp = timestamp;
    this.velocity = {
      x: velocity(delta.x),
      y: velocity(delta.y),
    };
    this.current = point;
  }
}
