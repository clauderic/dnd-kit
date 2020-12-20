import type {Transform} from '@dnd-kit/utilities';
import type {LayoutRect} from '../../types';

export function adjustScale(
  transform: Transform,
  rect1: LayoutRect | null,
  rect2: LayoutRect | null
): Transform {
  return {
    ...transform,
    scaleX: rect1 && rect2 ? rect1.width / rect2.width : 1,
    scaleY: rect1 && rect2 ? rect1.height / rect2.height : 1,
  };
}
