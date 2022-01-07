/* eslint-disable no-redeclare */
import type {ClientRect} from '../../types';

import type {Collision, CollisionDescriptor} from './types';

/**
 * Sort collisions from smallest to greatest value
 */
export function sortCollisionsAsc(
  {data: {value: a}}: CollisionDescriptor,
  {data: {value: b}}: CollisionDescriptor
) {
  return a - b;
}

/**
 * Sort collisions from greatest to smallest value
 */
export function sortCollisionsDesc(
  {data: {value: a}}: CollisionDescriptor,
  {data: {value: b}}: CollisionDescriptor
) {
  return b - a;
}

/**
 * Returns the coordinates of the corners of a given rectangle:
 * [TopLeft {x, y}, TopRight {x, y}, BottomLeft {x, y}, BottomRight {x, y}]
 */
export function cornersOfRectangle({left, top, height, width}: ClientRect) {
  return [
    {
      x: left,
      y: top,
    },
    {
      x: left + width,
      y: top,
    },
    {
      x: left,
      y: top + height,
    },
    {
      x: left + width,
      y: top + height,
    },
  ];
}

/**
 * Returns the first collision, or null if there isn't one.
 * If a property is specified, returns the specified property of the first collision.
 */
export function getFirstCollision(
  collisions: Collision[] | null | undefined
): Collision | null;
export function getFirstCollision<T extends keyof Collision>(
  collisions: Collision[] | null | undefined,
  property: T
): Collision[T] | null;
export function getFirstCollision(
  collisions: Collision[] | null | undefined,
  property?: keyof Collision
) {
  if (!collisions || collisions.length === 0) {
    return null;
  }

  const [firstCollision] = collisions;

  return property ? firstCollision[property] : firstCollision;
}
