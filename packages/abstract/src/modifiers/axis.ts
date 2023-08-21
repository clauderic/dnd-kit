import {createModifier} from '@dnd-kit/abstract';

export const RestrictToVerticalAxis = createModifier(({transform}) => {
  return {
    ...transform,
    x: 0,
  };
});

export const RestrictToHorizontalAxis = createModifier(({transform}) => {
  return {
    ...transform,
    y: 0,
  };
});
