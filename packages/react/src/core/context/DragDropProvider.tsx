'use client';

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import type {Data, DragDropEvents} from '@dnd-kit/abstract';
import {DragDropManager, defaultPreset} from '@dnd-kit/dom';
import type {DragDropManagerInput, Draggable, Droppable} from '@dnd-kit/dom';
import {useLatest, useOnValueChange} from '@dnd-kit/react/hooks';
import {deepEqual} from '@dnd-kit/state';

import {DragDropContext} from './context.ts';
import {Renderer, type ReactRenderer} from './renderer.ts';

export type Events<T extends Data = Data> = DragDropEvents<
  Draggable<T>,
  Droppable<T>,
  DragDropManager<Draggable<T>, Droppable<T>>
>;

export interface Props<T extends Data = Data>
  extends DragDropManagerInput,
    PropsWithChildren {
  manager?: DragDropManager;
  onBeforeDragStart?: Events<T>['beforedragstart'];
  onCollision?: Events<T>['collision'];
  onDragStart?: Events<T>['dragstart'];
  onDragMove?: Events<T>['dragmove'];
  onDragOver?: Events<T>['dragover'];
  onDragEnd?: Events<T>['dragend'];
}

const options = [undefined, deepEqual] as const;

export function DragDropProvider<T extends Data = Data>({
  children,
  onCollision,
  onBeforeDragStart,
  onDragStart,
  onDragMove,
  onDragOver,
  onDragEnd,
  ...input
}: Props<T>) {
  const rendererRef = useRef<ReactRenderer | null>(null);
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
    if (!rendererRef.current) throw new Error('Renderer not found');

    const {renderer, trackRendering} = rendererRef.current;

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
  }, [input.manager]);

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
      <Renderer ref={rendererRef}>{children}</Renderer>
      {children}
    </DragDropContext.Provider>
  );
}
