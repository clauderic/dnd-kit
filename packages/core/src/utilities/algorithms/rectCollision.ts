import {CollisionDetection} from './types';

/**
 * Returns true if both rectangles intersect
 */
function detectCollision(rect1: ClientRect, rect2: ClientRect): boolean {
  return Boolean(
    rect1.left < rect2.left + rect2.width &&
      rect1.left + rect1.width > rect2.left &&
      rect1.top < rect2.top + rect2.height &&
      rect1.height + rect1.top > rect2.top
  );
}

/**
 * Returns the first rectangle from an array of rectangles that collides with
 * a given rectangle.
 */
export const rectCollision: CollisionDetection = (rects, rect) => {
  const collidingRect = rects.find(([_, clientRect]) =>
    detectCollision(clientRect, rect)
  );

  return collidingRect ? collidingRect[0] : null;
};
