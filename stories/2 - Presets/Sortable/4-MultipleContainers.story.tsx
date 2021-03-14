import React from 'react';
import {
  closestCorners,
  CollisionDetection,
  DragEndEvent,
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

export const TrashableItems = ({confirm}: {confirm: boolean}) => {
  const [showConfirm, setShowConfirm] = React.useState(false);
  const resolveRef = React.useRef<(value: boolean) => void>();

  function confirmDrop({over}: DragEndEvent) {
    return (async function confirmDrop() {
      if (over?.id !== VOID_ID) {
        return true;
      }

      setShowConfirm(true);
      const confirmed: boolean = await new Promise((resolve) => {
        resolveRef.current = (value: boolean) => {
          resolve(value);
        };
      });
      setShowConfirm(false);

      return confirmed;
    })();
  }

  return (
    <>
      <MultipleContainers
        collisionDetection={customCollisionDetectionStrategy}
        confirmDrop={confirm ? confirmDrop : undefined}
        trashable
      />
      {showConfirm && (
        <ConfirmModal
          onConfirm={() => resolveRef.current?.(true)}
          onDeny={() => resolveRef.current?.(false)}
        >
          Are you sure you want to delete this item?
        </ConfirmModal>
      )}
    </>
  );
};

TrashableItems.argTypes = {
  confirm: {
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
