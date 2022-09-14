import type {BoundingRectangle} from '../types';

import {Point} from '../point';
import type {Shape} from './Shape';

export class ShapeGroup implements Shape {
  private shapes: Shape[];

  constructor(...shapes: Shape[]) {
    if (shapes.length === 0) {
      throw new Error('Group must have at least one shape');
    }

    this.shapes = shapes;
  }

  public scale = {
    x: 1,
    y: 1,
  };

  public translate(x: number, y: number): ShapeGroup {
    const shapes = this.shapes.map((shape) => shape.translate(x, y));

    return new ShapeGroup(...shapes);
  }

  public get area(): number {
    return this.shapes.reduce(
      (accumulator, current) => accumulator + current.area,
      0
    );
  }

  public containsPoint(point: Point): boolean {
    return this.shapes.some((shape) => shape.containsPoint(point));
  }

  public get boundingRectangle(): BoundingRectangle {
    const boundingRectangles = this.shapes.map(
      (shape) => shape.boundingRectangle
    );
    const minX = Math.min(...boundingRectangles.map(({left}) => left));
    const minY = Math.min(...boundingRectangles.map(({top}) => top));
    const maxX = Math.max(...boundingRectangles.map(({right}) => right));
    const maxY = Math.max(...boundingRectangles.map(({bottom}) => bottom));

    return {
      top: minY,
      left: minX,
      bottom: maxY,
      right: maxX,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  public get centroid(): Point {
    const {top, left, bottom, right} = this.boundingRectangle;

    return new Point((left + right) / 2, (top + bottom) / 2);
  }

  public intersectionArea(shape: Shape): number {
    return this.shapes.reduce(
      (accumulator, current) => accumulator + current.intersectionArea(shape),
      0
    );
  }
}
