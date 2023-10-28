import React, {Profiler, useMemo, useRef, useState} from 'react';
import {
  DndContext,
  useDraggable,
  UniqueIdentifier,
  CollisionDetection as CollisionDetectionType,
  Modifiers,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  Draggable,
  DraggableOverlay,
  Droppable,
  GridContainer,
  Wrapper,
} from '../../components';

export default {
  title: 'Core/DroppableRenders/useDroppable',
};

interface Props {
  collisionDetection?: CollisionDetectionType;
  containers?: string[];
  items?: string[];
  modifiers?: Modifiers;
  value?: string;
}
// we memoize the components to filters out the re-renders caused by the parent
// context changes won't be affected by this
const MemoDraggable = React.memo(DraggableItem);
const MemoDroppable = React.memo(Droppable);
function DroppableStory({
  containers = ['A'],
  items = ['1'],
  collisionDetection,
  modifiers,
}: Props) {
  const [parents, setParents] = useState<{
    [itemId: UniqueIdentifier]: UniqueIdentifier;
  }>({});
  const orphanItems = useMemo(
    () => items.filter((itemId) => !parents[itemId]),
    [items, parents]
  );
  const itemsPyParent = useMemo(() => {
    return Object.entries(parents).reduce((acc, [itemId, parentId]) => {
      acc[parentId] = acc[parentId] || [];
      acc[parentId].push(itemId);
      return acc;
    }, {} as {[parentId: UniqueIdentifier]: UniqueIdentifier[]});
  }, [parents]);

  const mouseSensor = useSensor(MouseSensor);
  const sensors = useSensors(mouseSensor);
  return (
    <DndContext
      collisionDetection={collisionDetection}
      modifiers={modifiers}
      sensors={sensors}
      onDragEnd={({over, active}) => {
        if ((!over && !parents[active.id]) || over?.id === parents[active.id]) {
          return;
        }
        if (over) {
          setParents((prev) => ({...prev, [active.id]: over.id}));
        } else {
          setParents((prev) => {
            const {[active.id]: _, ...rest} = prev;
            return rest;
          });
        }
      }}
    >
      <Wrapper>
        <Wrapper style={{width: 350, flexShrink: 0}}>
          {orphanItems.map((itemId) => (
            <MemoDraggable key={itemId} id={itemId} />
          ))}
        </Wrapper>
        <GridContainer columns={2}>
          {containers.map((id) => (
            <MemoDroppable key={id} id={id} showRenderState={true}>
              {itemsPyParent[id]?.map((itemId) => (
                <MemoDraggable key={itemId} id={itemId} />
              )) || null}
            </MemoDroppable>
          ))}
        </GridContainer>
      </Wrapper>
      <DraggableOverlay />
    </DndContext>
  );
}

interface DraggableProps {
  handle?: boolean;
  id: UniqueIdentifier;
}

function DraggableItem({handle, id}: DraggableProps) {
  const {isDragging, setNodeRef, listeners, attributes, transform} =
    useDraggable({
      id: id,
    });

  const span = useRef<HTMLSpanElement>(null);

  return (
    <Profiler
      id="App"
      onRender={(id, phase) => {
        if (phase === 'update' && span.current) {
          span.current.innerHTML = 'updated';
        }
      }}
    >
      <div>
        <span data-testid={`draggable-status-${id}`} ref={span}>
          mounted
        </span>
        <Draggable
          dragging={isDragging}
          ref={setNodeRef}
          handle={handle}
          listeners={listeners}
          label="Drag me"
          style={{
            opacity: isDragging ? 0 : undefined,
          }}
          transform={transform}
          {...attributes}
        />
      </div>
    </Profiler>
  );
}

export const MultipleDroppables = () => (
  <DroppableStory containers={['A', 'B', 'C']} items={['1', '2', '3']} />
);
