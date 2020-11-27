import React, {useState} from 'react';

import {restrictToWindowEdges} from '@dropshift/core';
import {verticalListSortingStrategy} from '@dropshift/sortable';
import {restrictToVerticalAxis} from '@dropshift/modifiers';

import {createRange} from '../../utilities';
import {Sortable, Props as SortableProps} from '../Sortable';
import {
  Button,
  FloatingControls,
  PlayingCard,
  getDeckOfCards,
  shuffle,
} from '../../components';

export default {
  title: 'Presets|Sortable/Vertical',
};

const props: Partial<SortableProps> = {
  strategy: verticalListSortingStrategy,
  itemCount: 50,
};

export const BasicSetup = () => <Sortable {...props} />;

export const WithoutClone = () => (
  <Sortable {...props} useClone={false} itemCount={5} />
);

export const DragHandle = () => <Sortable {...props} handle />;

export const LockedAxis = () => (
  <Sortable
    {...props}
    translateModifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
  />
);

export const ScrollContainer = () => (
  <div
    style={{
      height: '50vh',
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

export const VariableHeights = () => {
  const randomHeights = createRange(props.itemCount as number).map(() => {
    const heights = [110, undefined, 140, undefined, 90, undefined];
    const randomHeight = heights[Math.floor(Math.random() * heights.length)];

    return randomHeight;
  });

  return (
    <Sortable
      {...props}
      wrapperStyle={({index}) => {
        return {
          height: randomHeights[index],
        };
      }}
    />
  );
};

export const TransformedItems = () => {
  const [deck, setDeck] = useState(getDeckOfCards);

  return (
    <>
      <FloatingControls>
        <Button onClick={() => setDeck(shuffle(getDeckOfCards()))}>
          Shuffle cards
        </Button>
      </FloatingControls>
      <div style={{position: 'relative', marginTop: 50}}>
        <Sortable
          {...props}
          items={deck.map(({suit, value}) => `${value}${suit}`)}
          renderItem={({
            dragging,
            value,
            clone,
            listeners,
            ref,
            style,
            index,
            transform,
          }: any) => (
            <PlayingCard
              value={value}
              isDragging={dragging}
              isPickedUp={clone}
              ref={ref}
              style={style}
              index={index}
              transform={transform}
              {...listeners}
            />
          )}
          getItemStyles={({index, overIndex, isDragging}) => ({
            zIndex: isDragging ? deck.length - overIndex : deck.length - index,
            opacity: isDragging ? 0.3 : undefined,
          })}
        />
      </div>
    </>
  );
};

export const DisabledItems = () => (
  <Sortable
    {...props}
    isDisabled={(value) => ['1', '5', '8', '13', '20'].includes(value)}
  />
);

export const MarginBetweenItems = () => {
  const getMargin = (index: number) => {
    if ([0, 6, 25, 45].includes(index)) {
      return 25;
    }

    if ([10, 15, 35].includes(index)) {
      return 80;
    }

    return 0;
  };

  return (
    <Sortable
      {...props}
      wrapperStyle={({index}) => {
        return {
          marginBottom: getMargin(index),
        };
      }}
    />
  );
};

export const RerenderBeforeSorting = () => {
  return (
    <Sortable
      {...props}
      wrapperStyle={({isDragging}) => {
        return {
          height: isDragging ? 80 : undefined,
        };
      }}
    />
  );
};
