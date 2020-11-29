import type {Modifier} from '@dnd-kit/core';

export const restrictToVerticalAxis: Modifier = ({transform}) => {
  return {
    ...transform,
    x: 0,
  };
};
