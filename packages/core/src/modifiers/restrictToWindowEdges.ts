import type {Modifier} from './types';

export const restrictToWindowEdges: Modifier = ({transform, activeRect}) => {
  if (!activeRect) {
    return transform;
  }

  let x = transform.x;
  let y = transform.y;

  if (activeRect.top + transform.y <= 0) {
    y = -activeRect.top;
  } else if (activeRect.bottom + transform.y >= window.innerHeight) {
    y = window.innerHeight - activeRect.bottom;
  }

  if (activeRect.left + transform.x <= 0) {
    x = -activeRect.left;
  } else if (activeRect.right + transform.x >= window.innerWidth) {
    x = window.innerWidth - activeRect.right;
  }

  return {
    ...transform,
    x,
    y,
  };
};
