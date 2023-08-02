import {PropsWithChildren, useEffect} from 'react';
import type {DragDropEvents} from '@dnd-kit/abstract';
import {DragDropManager} from '@dnd-kit/dom';

import {useComputed, useConstant, useEvent} from '../hooks';

import {DragDropContext} from './context';

export interface Props {
  onDragStart?(event: DragDropEvents['dragstart']): void;
  onDragOver?(event: DragDropEvents['dragover']): void;
  onDragEnd?(event: DragDropEvents['dragend']): void;
}

export function DndContext({
  children,
  onDragStart,
  onDragOver,
  onDragEnd,
}: PropsWithChildren<Props>) {
  const manager = useConstant(() => new DragDropManager());
  const handleDragStart = useEvent(onDragStart);
  const handleDragOver = useEvent(onDragOver);
  const handleDragEnd = useEvent(onDragEnd);

  useEffect(() => {
    manager.monitor.addEventListener('dragstart', handleDragStart);
    manager.monitor.addEventListener('dragover', handleDragOver);
    manager.monitor.addEventListener('dragend', handleDragEnd);

    return () => {
      manager.destroy();
    };
  }, []);

  const firstCollision = useComputed(() => {
    const {collisions} = manager.collisionObserver;

    return collisions && collisions.length > 0 ? collisions[0].id : null;
  }).value;

  useEffect(() => {
    manager.actions.setDropTarget(firstCollision);
  }, [firstCollision]);

  return (
    <DragDropContext.Provider value={manager}>
      {children}
    </DragDropContext.Provider>
  );
}
