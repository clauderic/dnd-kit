import React from 'react';
import {
  closestCorners,
  CollisionDetection,
  rectIntersection,
} from '@dnd-kit/core';
import {rectSortingStrategy} from '@dnd-kit/sortable';

import {Selectable, defaultContainerStyle, VOID_ID} from './Selectable';

export default {
  title: 'Presets/Sortable/Multiple Item Dragging',
};

export const BasicSetup = () => <Selectable />;

export const ManyItems = () => (
  <Selectable
    itemCount={15}
    getContainerStyle={(args) => ({
      ...defaultContainerStyle(args),
      maxHeight: '80vh',
      overflowY: 'auto',
    })}
  />
);

export const Vertical = () => <Selectable itemCount={5} vertical />;

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
  <Selectable collisionDetection={customCollisionDetectionStrategy} trashable />
);

export const Grid = () => (
  <Selectable
    columns={2}
    strategy={rectSortingStrategy}
    wrapperStyle={() => ({
      width: 150,
      height: 150,
    })}
  />
);

export const VerticalGrid = () => (
  <Selectable
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
