import type {Modifier} from '@dropshift/core';

export const restrictToVerticalAxis: Modifier = ({transform}) => {
  return {
    ...transform,
    x: 0,
  };
};
