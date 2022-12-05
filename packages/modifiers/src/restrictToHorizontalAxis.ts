import type {Modifier} from '@schuchertmanagementberatung/dnd-kit-core';

export const restrictToHorizontalAxis: Modifier = ({transform}) => {
  return {
    ...transform,
    y: 0,
  };
};
