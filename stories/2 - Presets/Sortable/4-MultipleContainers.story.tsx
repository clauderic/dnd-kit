import React from 'react';
import {
  closestCorners,
  CollisionDetection,
  rectIntersection,
} from '@dnd-kit/core';
import {rectSortingStrategy} from '@dnd-kit/sortable';

import {
  MultipleContainers,
  defaultContainerStyle,
  VOID_ID,
} from './MultipleContainers';

export const BasicSetup = () => <MultipleContainers />;

export const ManyItems = () => (
  <MultipleContainers
    itemCount={15}
    getContainerStyle={(args) => ({
      ...defaultContainerStyle(args),
      maxHeight: '80vh',
      overflowY: 'auto',
    })}
  />
);

export const Vertical = () => <MultipleContainers itemCount={5} vertical />;

const customCollisionDetectionStrategy: CollisionDetection = (rects, rect) => {
  const voidRects = rects.filter(([id]) => id === VOID_ID);
  const intersectingVoidRect = rectIntersection(voidRects, rect);

  if (intersectingVoidRect) {
    return intersectingVoidRect;
  }

  const otherRects = rects.filter(([id]) => id !== VOID_ID);
  return closestCorners(otherRects, rect);
};

export const TrashableItems = () => (
  <MultipleContainers
    collisionDetection={customCollisionDetectionStrategy}
    trashable
  />
);

export const Grid = () => (
  <MultipleContainers
    columns={2}
    strategy={rectSortingStrategy}
    wrapperStyle={() => ({
      width: 150,
      height: 150,
    })}
  />
);

export const VerticalGrid = () => (
  <MultipleContainers
    columns={2}
    itemCount={5}
    strategy={rectSortingStrategy}
    wrapperStyle={() => ({
      width: 150,
      height: 150,
    })}
    vertical
  />
);
