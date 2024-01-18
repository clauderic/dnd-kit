import type {AnyData, Modifier} from '@dnd-kit/core';

export const restrictToVerticalAxis: Modifier<AnyData, AnyData> = ({
  transform,
}) => {
  return {
    ...transform,
    x: 0,
  };
};
