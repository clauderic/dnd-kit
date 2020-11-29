import type {Modifier} from '@dnd-kit/core';

export const restrictToHorizontalAxis: Modifier = ({transform}) => {
  return {
    ...transform,
    y: 0,
  };
};
