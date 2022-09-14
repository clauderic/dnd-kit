import {Point} from '../point';

import type {Shape} from './Shape';

export class Polygon {
  //implements Shape {
  protected vertices: Point[];

  constructor(...vertices: Point[]) {
    this.vertices = vertices;
  }

  public scale = {
    x: 1,
    y: 1,
  };

  public get centroid() {
    const n = this.vertices.length;

    let x = 0;
    let y = 0;

    for (const vertex of this.vertices) {
      x += vertex.x;
      y += vertex.y;
    }

    return new Point(x / n, y / n);
  }

  public get area() {
    const {vertices} = this;

    // Initialize area
    let area = 0;

    // Calculate area using shoelace formula
    let previousVertex = vertices[vertices.length - 1];

    for (const vertex of this.vertices) {
      area += (previousVertex.x + vertex.x) * (previousVertex.y - vertex.y);

      previousVertex = vertex;
    }

    // Return absolute value
    return Math.abs(area / 2.0);
  }

  public containsPoint(point: Point): boolean {
    const {vertices} = this;

    const x = vertices.map((point) => point.x);
    const y = vertices.map((point) => point.y);
    const min = {
      x: Math.min(...x),
      y: Math.min(...y),
    };
    const max = {
      x: Math.max(...x),
      y: Math.max(...y),
    };

    if (
      point.x < min.x ||
      point.x > max.x ||
      point.y < min.y ||
      point.y > max.y
    ) {
      return false;
    }

    let contained = false;

    let previousVertex = vertices[vertices.length - 1];

    for (const vertex of vertices) {
      if (
        vertex.y > point.y != previousVertex.y > point.y &&
        point.x <
          ((previousVertex.x - vertex.x) * (point.y - vertex.y)) /
            (previousVertex.y - vertex.y) +
            vertex.x
      ) {
        contained = !contained;

        previousVertex = vertex;
      }
    }

    return contained;
  }

  public intersectionArea(shape: Shape) {
    // TO-DO
    // if (shape instanceof Circle) {
    //   return 0;
    // }
    return 0;
  }
}
