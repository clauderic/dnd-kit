import {
  startTransition,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import type {DragDropEvents} from '@dnd-kit/abstract';
import {DragDropManager, defaultPreset} from '@dnd-kit/dom';
import type {DragDropManagerInput, Draggable, Droppable} from '@dnd-kit/dom';
import {useLatest, useOnValueChange} from '@dnd-kit/react/hooks';
import {deepEqual} from '@dnd-kit/state';

import {DragDropContext} from './context.ts';
import {useRenderer} from './renderer.ts';

type Events = DragDropEvents<Draggable, Droppable, DragDropManager>;

export interface Props extends DragDropManagerInput, PropsWithChildren {
  manager?: DragDropManager;
  onBeforeDragStart?: Events['beforedragstart'];
  onCollision?: Events['collision'];
  onDragStart?: Events['dragstart'];
  onDragMove?: Events['dragmove'];
  onDragOver?: Events['dragover'];
  onDragEnd?: Events['dragend'];
}

const options = [undefined, deepEqual] as const;

export function DragDropProvider({
  children,
  onCollision,
  onBeforeDragStart,
  onDragStart,
  onDragMove,
  onDragOver,
  onDragEnd,
  ...input
}: Props) {
  const {renderer, trackRendering} = useRenderer();
  const [manager, setManager] = useState<DragDropManager | null>(
    input.manager ?? null
  );
  const {plugins, modifiers, sensors} = input;
  const handleBeforeDragStart = useLatest(onBeforeDragStart);
  const handleDragStart = useLatest(onDragStart);
  const handleDragOver = useLatest(onDragOver);
  const handleDragMove = useLatest(onDragMove);
  const handleDragEnd = useLatest(onDragEnd);
  const handleCollision = useLatest(onCollision);

  useEffect(() => {
    const manager = input.manager ?? new DragDropManager(input);
    manager.renderer = renderer;

    manager.monitor.addEventListener('beforedragstart', (event, manager) => {
      const callback = handleBeforeDragStart.current;

      if (callback) {
        trackRendering(() => callback(event, manager));
      }
    });
    manager.monitor.addEventListener('dragstart', (event, manager) =>
      handleDragStart.current?.(event, manager)
    );
    manager.monitor.addEventListener('dragover', (event, manager) => {
      const callback = handleDragOver.current;

      if (callback) {
        trackRendering(() => callback(event, manager));
      }
    });
    manager.monitor.addEventListener('dragmove', (event, manager) => {
      const callback = handleDragMove.current;

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
    manager.monitor.addEventListener('collision', (event, manager) =>
      handleCollision.current?.(event, manager)
    );

    startTransition(() => setManager(manager));

    return manager.destroy;
  }, [renderer, input.manager]);

  useOnValueChange(
    plugins,
    () => manager && (manager.plugins = plugins ?? defaultPreset.plugins),
    ...options
  );
  useOnValueChange(
    sensors,
    () => manager && (manager.sensors = sensors ?? defaultPreset.sensors),
    ...options
  );
  useOnValueChange(
    modifiers,
    () => manager && (manager.modifiers = modifiers ?? defaultPreset.modifiers),
    ...options
  );

  return (
    <DragDropContext.Provider value={manager}>
      {children}
    </DragDropContext.Provider>
  );
}
