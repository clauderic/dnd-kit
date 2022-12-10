import React, {useState} from 'react';
import {
  closestCenter,
  closestCorners,
  rectIntersection,
  pointerWithin,
  DndContext,
  useDraggable,
  UniqueIdentifier,
  CollisionDetection as CollisionDetectionType,
  Modifiers,
} from '@dnd-kit/core';

import {useUniqueId} from '@dnd-kit/utilities';
import {
  Draggable,
  DraggableOverlay,
  Droppable,
  GridContainer,
  Wrapper,
} from '../../components';

export default {
  title: 'Core/Droppable/useDroppable',
};

interface Props {
  collisionDetection?: CollisionDetectionType;
  containers?: string[];
  modifiers?: Modifiers;
  value?: string;
  placeholder?: boolean;
}

function DroppableStory({
  containers = ['A'],
  collisionDetection,
  modifiers,
  placeholder = false,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [parent, setParent] = useState<UniqueIdentifier | null>(null);

  const item = <DraggableItem />;

  const placeholderId = useUniqueId('Placeholder');

  return (
    <DndContext
      collisionDetection={collisionDetection}
      modifiers={parent === null ? undefined : modifiers}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={({over}) => {
        setParent(over ? over.id : null);
        setIsDragging(false);
      }}
      onDragCancel={() => setIsDragging(false)}
    >
      <Wrapper>
        <Wrapper style={{width: 350, flexShrink: 0}}>
          {parent === null ? item : null}
        </Wrapper>
        <GridContainer columns={2}>
          {containers.map((id) => (
            <Droppable
              key={id}
              id={id}
              dragging={isDragging}
              placeholderId={placeholderId}
            >
              {parent === id ? item : null}
              {parent !== id && placeholder && (
                <PlaceholderItem
                  placeholderId={placeholderId}
                  placeholderContainerId={id}
                />
              )}
            </Droppable>
          ))}
        </GridContainer>
      </Wrapper>
      <DraggableOverlay />
    </DndContext>
  );
}

interface DraggableProps {
  handle?: boolean;
}

function DraggableItem({handle}: DraggableProps) {
  const {isDragging, setNodeRef, listeners} = useDraggable({
    id: 'draggable-item',
  });

  return (
    <Draggable
      dragging={isDragging}
      ref={setNodeRef}
      handle={handle}
      listeners={listeners}
      style={{
        opacity: isDragging ? 0 : undefined,
      }}
    />
  );
}

interface PlaceholderItemProps {
  placeholderId: string;
  placeholderContainerId: string;
}

function PlaceholderItem({
  placeholderId,
  placeholderContainerId,
}: PlaceholderItemProps) {
  const {isDragging, over, setNodeRef} = useDraggable({
    id: placeholderId,
    placeholder: true,
    placeholderContainerId: placeholderContainerId,
  });

  const isPlaceholderActive = over?.id === placeholderContainerId;

  if (!isPlaceholderActive) {
    return null;
  }

  return <Draggable dragging={isDragging} ref={setNodeRef} />;
}

export const BasicSetup = () => <DroppableStory />;

export const Placeholder = () => <DroppableStory placeholder />;

export const MultipleDroppables = () => (
  <DroppableStory containers={['A', 'B', 'C']} />
);

export const CollisionDetectionAlgorithms = () => {
  const [{algorithm}, setCollisionDetectionAlgorithm] = useState({
    algorithm: rectIntersection,
  });

  return (
    <>
      <DroppableStory
        collisionDetection={algorithm}
        containers={['A', 'B', 'C']}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h3>Collision detection algorithm</h3>
        <label>
          <input
            type="radio"
            value="rectIntersection"
            checked={algorithm === rectIntersection}
            onClick={() =>
              setCollisionDetectionAlgorithm({algorithm: rectIntersection})
            }
          />
          Rect Intersection
        </label>
        <label>
          <input
            type="radio"
            value="closestCenter"
            checked={algorithm === closestCenter}
            onClick={() =>
              setCollisionDetectionAlgorithm({algorithm: closestCenter})
            }
          />
          Closest Center
        </label>
        <label>
          <input
            type="radio"
            value="closestCorners"
            checked={algorithm === closestCorners}
            onClick={() =>
              setCollisionDetectionAlgorithm({algorithm: closestCorners})
            }
          />
          Closest Corners
        </label>
        <label>
          <input
            type="radio"
            value="pointerWithin"
            checked={algorithm === pointerWithin}
            onClick={() =>
              setCollisionDetectionAlgorithm({algorithm: pointerWithin})
            }
          />
          Pointer Within
        </label>
      </div>
    </>
  );
};
