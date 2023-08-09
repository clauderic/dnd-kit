import {PropsWithChildren, useEffect} from 'react';
import type {DragDropEvents} from '@dnd-kit/abstract';
import {DragDropManager, type Draggable, type Droppable} from '@dnd-kit/dom';

import {useConstant, useEvent} from '../hooks';

import {DragDropContext} from './context';

type Events = DragDropEvents<Draggable, Droppable, DragDropManager>;

export interface Props {
  onCollision?: Events['collision'];
  onDragStart?: Events['dragstart'];
  onDragOver?: Events['dragover'];
  onDragEnd?: Events['dragend'];
}

export function DragDropProvider({
  children,
  onCollision,
  onDragStart,
  onDragOver,
  onDragEnd,
}: PropsWithChildren<Props>) {
  const manager = useConstant(() => new DragDropManager());
  const handleDragStart = useEvent(onDragStart);
  const handleDragOver = useEvent(onDragOver);
  const handleDragEnd = useEvent(onDragEnd);
  const handleCollision = useEvent(onCollision);

  useEffect(() => {
    manager.monitor.addEventListener('dragstart', handleDragStart);
    manager.monitor.addEventListener('dragover', handleDragOver);
    manager.monitor.addEventListener('dragend', handleDragEnd);
    manager.monitor.addEventListener('collision', handleCollision);

    return () => {
      manager.destroy();
    };
  }, []);

  return (
    <DragDropContext.Provider value={manager}>
      {children}
    </DragDropContext.Provider>
  );
}
