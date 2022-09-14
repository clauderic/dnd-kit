import {PropsWithChildren, useEffect, useState} from 'react';
import {DragDropManager, PointerSensor} from '@dnd-kit/dom';

import {DragDropContext} from './context';
import {useComputed} from '@preact/signals-react';

export interface Props {}

export function DndContext({children}: PropsWithChildren<Props>) {
  const [manager] = useState(() => new DragDropManager());

  useEffect(() => {
    const sensor = new PointerSensor(manager);
  }, [manager]);

  const over = useComputed(() => {
    const {collisions} = manager.collisionObserver;

    return collisions && collisions.length > 0 ? collisions[0].id : null;
  }).value;

  useEffect(() => {
    manager.actions.over(over);
  }, [over]);

  return (
    <DragDropContext.Provider value={manager}>
      {children}
    </DragDropContext.Provider>
  );
}
