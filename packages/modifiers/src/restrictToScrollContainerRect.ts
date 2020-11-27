import type {Modifier} from '@dropshift/core';

export const restrictToScrollContainerRect: Modifier = ({
  transform,
  activeRect,
  scrollingContainerRect,
}) => {
  if (!activeRect || !scrollingContainerRect) {
    return transform;
  }

  let x = transform.x;
  let y = transform.y;

  if (scrollingContainerRect.right + transform.x >= activeRect.right) {
    x = activeRect.right - scrollingContainerRect.right;
  } else if (scrollingContainerRect.left + transform.x <= activeRect.left) {
    x = activeRect.left - scrollingContainerRect.left;
  }

  if (scrollingContainerRect.bottom + transform.y >= activeRect.bottom) {
    y = activeRect.bottom - scrollingContainerRect.bottom;
  } else if (scrollingContainerRect.top + transform.y <= activeRect.top) {
    y = activeRect.top - scrollingContainerRect.top;
  }

  return {
    ...transform,
    x,
    y,
  };
};
