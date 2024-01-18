import type {AnyData, Modifier} from '@dnd-kit/core';

export const restrictToHorizontalAxis: Modifier<AnyData, AnyData> = ({
  transform,
}) => {
  return {
    ...transform,
    y: 0,
  };
};
