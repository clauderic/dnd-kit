import type {Modifier} from '@dropshift/core';

export const restrictToHorizontalAxis: Modifier = ({transform}) => {
  return {
    ...transform,
    y: 0,
  };
};
