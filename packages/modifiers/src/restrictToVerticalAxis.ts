import type {Modifier} from '@schuchertmanagementberatung/dnd-kit-core';

export const restrictToVerticalAxis: Modifier = ({transform}) => {
  return {
    ...transform,
    x: 0,
  };
};
