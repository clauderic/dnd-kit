import {
  forwardRef,
  useImperativeHandle,
  useEffect,
  type PropsWithChildren,
} from 'react';
import {type DragDropEvents} from '@dnd-kit/abstract';
import {DragDropManager, defaultPreset} from '@dnd-kit/dom';
import type {DragDropManagerInput, Draggable, Droppable} from '@dnd-kit/dom';

import {useConstant, useEvent, useLatest, useOnValueChange} from '../hooks';

import {DragDropContext} from './context';
import {useRenderer} from './renderer';

type Events = DragDropEvents<Draggable, Droppable, DragDropManager>;

export interface Props extends DragDropManagerInput, PropsWithChildren {
  onBeforeDragStart?: Events['beforedragstart'];
  onCollision?: Events['collision'];
  onDragStart?: Events['dragstart'];
  onDragOver?: Events['dragover'];
  onDragEnd?: Events['dragend'];
}

export const DragDropProvider = forwardRef<DragDropManager, Props>(
  function DragDropProvider(
    {
      children,
      onCollision,
      onBeforeDragStart,
      onDragStart,
      onDragOver,
      onDragEnd,
      ...input
    },
    ref
  ) {
    const {renderer, trackRendering} = useRenderer();
    const manager = useConstant(
      () => new DragDropManager({...input, renderer})
    );
    const {plugins} = input;
    const handleBeforeDragStart = useLatest(onBeforeDragStart);
    const handleDragStart = useEvent(onDragStart);
    const handleDragOver = useLatest(onDragOver);
    const handleDragEnd = useLatest(onDragEnd);
    const handleCollision = useEvent(onCollision);

    useEffect(() => {
      manager.monitor.addEventListener('beforedragstart', (event, manager) => {
        const callback = handleBeforeDragStart.current;

        if (callback) {
          trackRendering(() => callback(event, manager));
        }
      });
      manager.monitor.addEventListener('dragstart', handleDragStart);
      manager.monitor.addEventListener('dragover', (event, manager) => {
        const callback = handleDragOver.current;

        if (callback) {
          trackRendering(() => callback(event, manager));
        }
      });
      manager.monitor.addEventListener('dragend', (event, manager) => {
        const callback = handleDragEnd.current;

        if (callback) {
          trackRendering(() => callback(event, manager));
        }
      });
      manager.monitor.addEventListener('collision', handleCollision);

      return () => {
        manager.destroy();
      };
    }, []);

    useOnValueChange(
      plugins,
      () => (manager.plugins = plugins ?? defaultPreset.plugins)
    );

    useImperativeHandle(ref, () => manager, [manager]);

    return (
      <DragDropContext.Provider value={manager}>
        {children}
      </DragDropContext.Provider>
    );
  }
);
