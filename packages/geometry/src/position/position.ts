import {batch, derived, reactive} from '@dnd-kit/state';

import {Point} from '../point';
import type {Coordinates} from '../types';

export class Position {
  constructor(initialValue: Coordinates) {
    const point = Point.from(initialValue);

    this.initial = point;
    this.current = point;
  }

  @reactive
  public initial: Point;

  @reactive
  public current: Point;

  @derived
  public get delta() {
    return Point.delta(this.current, this.initial);
  }

  public reset(coordinates: Coordinates) {
    const point = Point.from(coordinates);

    batch(() => {
      this.current = point;
      this.initial = point;
    });
  }

  public update(coordinates: Coordinates) {
    const {current} = this;
    const point = Point.from(coordinates);

    if (Point.equals(current, point)) {
      return;
    }

    this.current = point;
  }
}
