import React, {useEffect, useState} from 'react';
import {
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import {Sortable} from '../../../2 - Presets/Sortable/Sortable';
import {MultipleContainers} from '../../../2 - Presets/Sortable/MultipleContainers';
import {PlayingCard, getDeckOfCards} from './PlayingCard';

export default {
  title: 'Examples/2D Games/Playing Cards',
};

export const SingleDeck = () => {
  const [deck] = useState(getDeckOfCards);

  return (
    <div style={{position: 'relative', marginTop: 50, paddingBottom: 250}}>
      <Sortable
        strategy={verticalListSortingStrategy}
        items={deck.map(({suit, value}) => `${value}${suit}`)}
        renderItem={({
          dragging,
          value,
          dragOverlay,
          listeners,
          ref,
          style,
          index,
          sorting,
          transform,
          transition,
        }: any) => (
          <PlayingCard
            value={value}
            isDragging={dragging}
            isPickedUp={dragOverlay}
            isSorting={sorting}
            ref={ref}
            style={style}
            index={index}
            transform={transform}
            transition={transition}
            {...listeners}
          />
        )}
        getItemStyles={({index, overIndex, isDragging, isDragOverlay}) => ({
          zIndex: isDragging ? deck.length - overIndex : deck.length - index,
          opacity: isDragging && !isDragOverlay ? 0.3 : undefined,
        })}
      />
    </div>
  );
};

function stringifyDeck(
  deck: {
    value: string;
    suit: string;
  }[],
  prefix: string
) {
  return deck.map(({suit, value}) => `${prefix}-${value}${suit}`);
}

export const MultipleDecks = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [decks] = useState(() => {
    const deck = getDeckOfCards();
    const deckA = deck.slice(0, 13);
    const deckB = deck.slice(13, 26);
    const deckC = deck.slice(26, 39);
    const deckD = deck.slice(39, 52);

    return {
      A: stringifyDeck(deckA, 'A'),
      B: stringifyDeck(deckB, 'B'),
      C: stringifyDeck(deckC, 'C'),
      D: stringifyDeck(deckD, 'D'),
    };
  });

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 2500);
  }, []);

  return (
    <>
      <style>
        {`
          main {
            top: 100px;
            left: 140px;
          }
        `}
      </style>
      <MultipleContainers
        strategy={rectSortingStrategy}
        items={decks}
        renderItem={({
          value,
          dragOverlay,
          dragging,
          sorting,
          index,
          listeners,
          ref,
          style,
          transform,
          transition,
          fadeIn,
        }: any) => (
          <PlayingCard
            value={value.substring(2, value.length)}
            isDragging={dragging}
            isPickedUp={dragOverlay}
            isSorting={sorting}
            ref={ref}
            style={style}
            index={index}
            transform={transform}
            transition={transition}
            mountAnimation={!dragOverlay && !isMounted}
            fadeIn={fadeIn}
            {...listeners}
          />
        )}
        containerStyle={{
          position: 'relative',
          flexShrink: 0,
          width: 330,
          top: -100,
          margin: '20px 20px',
        }}
        getItemStyles={({
          index,
          overIndex,
          isDragging,
          containerId,
          isDragOverlay,
        }) => {
          const deck = decks[containerId as keyof typeof decks] || [];

          return {
            zIndex: isDragOverlay
              ? undefined
              : isDragging
              ? deck.length - overIndex
              : deck.length - index,
          };
        }}
        minimal
      />
    </>
  );
};
