import React from 'react';
import {MeasuringStrategy} from '@dnd-kit/core';
import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {restrictToHorizontalAxis} from '@dnd-kit/modifiers';

import {createRange} from '../../utilities';
import {List} from '../../components';
import {Sortable, Props as SortableProps} from './Sortable';

export default {
  title: 'Presets/Sortable/Horizontal',
};

const itemCount = 50;
const baseStyles: React.CSSProperties = {
  height: 150,
  width: 150,
};

const props: Partial<SortableProps> = {
  Container: (props: any) => <List horizontal {...props} />,
  itemCount,
  getItemStyles: () => baseStyles,
  strategy: horizontalListSortingStrategy,
};

export const BasicSetup = () => <Sortable {...props} />;

export const DragHandle = () => <Sortable {...props} handle />;

export const LockedAxis = () => (
  <Sortable {...props} modifiers={[restrictToHorizontalAxis]} />
);

export const ScrollContainer = () => (
  <div
    style={{
      width: '50vw',
      margin: '0 auto',
      overflow: 'auto',
    }}
  >
    <Sortable {...props} />
  </div>
);

export const PressDelay = () => (
  <Sortable
    {...props}
    activationConstraint={{
      delay: 250,
      tolerance: 5,
    }}
  />
);

export const MinimumDistance = () => (
  <Sortable
    {...props}
    activationConstraint={{
      distance: 15,
    }}
  />
);

export const VariableWidths = () => {
  const randomWidths = createRange(itemCount).map(() => {
    const widths = [110, undefined, 140, undefined, 90, undefined];
    const randomWidth = widths[Math.floor(Math.random() * widths.length)];

    return randomWidth;
  });

  return (
    <Sortable
      {...props}
      wrapperStyle={({id}) => {
        return {
          width: randomWidths[Number(id)],
        };
      }}
    />
  );
};

export const MarginBetweenItems = () => {
  const getMargin = (index: number) => {
    if ([0, 6, 25, 45].includes(index)) {
      return 25;
    }

    if ([10, 15, 35].includes(index)) {
      return 80;
    }

    return undefined;
  };

  return (
    <Sortable
      {...props}
      wrapperStyle={({index}) => {
        return {
          ...baseStyles,
          marginRight: getMargin(index),
        };
      }}
    />
  );
};

export const RemovableItems = () => {
  const animateLayoutChanges: AnimateLayoutChanges = (args) =>
    defaultAnimateLayoutChanges({...args, wasDragging: true});

  return (
    <Sortable
      {...props}
      animateLayoutChanges={animateLayoutChanges}
      measuring={{droppable: {strategy: MeasuringStrategy.Always}}}
      removable
      handle
    />
  );
};
