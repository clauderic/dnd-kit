import {BoundingRectangle, Point} from '@dnd-kit/geometry';

export default function applyOffset(
  rect: BoundingRectangle,
  offset: Point
): BoundingRectangle {
  return {
    top: (rect.top || 0) + offset.y,
    left: (rect.left || 0) + offset.x,
    right: (rect.right || 0) + offset.x,
    bottom: (rect.bottom || 0) + offset.y,
    width: rect.width || 0,
    height: rect.height || 0,
  };
}
