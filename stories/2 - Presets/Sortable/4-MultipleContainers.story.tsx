import React from 'react';
import {
  CancelDrop,
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

import {ConfirmModal} from '../../components';

export default {
  title: 'Presets/Sortable/Multiple Containers',
};

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

export const TrashableItems = ({confirmDrop}: {confirmDrop: boolean}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const resolveRef = React.useRef<(value: boolean) => void>();

  const cancelDrop: CancelDrop = async ({active, over}) => {
    if (over?.id !== VOID_ID) {
      return true;
    }

    setActiveId(active.id);

    const confirmed = await new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });

    setActiveId(null);

    return confirmed === false;
  };

  return (
    <>
      <MultipleContainers
        collisionDetection={customCollisionDetectionStrategy}
        cancelDrop={confirmDrop ? cancelDrop : undefined}
        trashable
      />
      {activeId && (
        <ConfirmModal
          onConfirm={() => resolveRef.current?.(true)}
          onDeny={() => resolveRef.current?.(false)}
        >
          Are you sure you want to delete "{activeId}"?
        </ConfirmModal>
      )}
    </>
  );
};

TrashableItems.argTypes = {
  confirmDrop: {
    name: 'Request user confirmation before deletion',
    defaultValue: false,
    control: {type: 'boolean'},
  },
};

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
