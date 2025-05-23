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

export type Events<
  T extends Data = Data,
  U extends Draggable<T> = Draggable<T>,
  V extends Droppable<T> = Droppable<T>,
  W extends DragDropManager<T, U, V> = DragDropManager<T, U, V>,
> = DragDropEvents<U, V, W>;

export interface Props<
  T extends Data = Data,
  U extends Draggable<T> = Draggable<T>,
  V extends Droppable<T> = Droppable<T>,
  W extends DragDropManager<T, U, V> = DragDropManager<T, U, V>,
> extends DragDropManagerInput,
    PropsWithChildren {
  manager?: W;
  onBeforeDragStart?: Events<T, U, V, W>['beforedragstart'];
  onCollision?: Events<T, U, V, W>['collision'];
  onDragStart?: Events<T, U, V, W>['dragstart'];
  onDragMove?: Events<T, U, V, W>['dragmove'];
  onDragOver?: Events<T, U, V, W>['dragover'];
  onDragEnd?: Events<T, U, V, W>['dragend'];
}

const options = [undefined, deepEqual] as const;

export function DragDropProvider<
  T extends Data = Data,
  U extends Draggable<T> = Draggable<T>,
  V extends Droppable<T> = Droppable<T>,
  W extends DragDropManager<T, U, V> = DragDropManager<T, U, V>,
>({
  children,
  onCollision,
  onBeforeDragStart,
  onDragStart,
  onDragMove,
  onDragOver,
  onDragEnd,
  ...input
}: Props<T, U, V, W>) {
  const rendererRef = useRef<ReactRenderer | null>(null);
  const [manager, setManager] = useState<W | null>(input.manager ?? null);
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

    const manager = input.manager ?? (new DragDropManager<T, U, V>(input) as W);
    manager.renderer = renderer;

    manager.monitor.addEventListener('beforedragstart', (event) => {
      const callback = handleBeforeDragStart.current;

      if (callback) {
        trackRendering(() => callback(event, manager));
      }
    });
    manager.monitor.addEventListener('dragstart', (event) =>
      handleDragStart.current?.(event, manager)
    );
    manager.monitor.addEventListener('dragover', (event) => {
      const callback = handleDragOver.current;

      if (callback) {
        trackRendering(() => callback(event, manager));
      }
    });
    manager.monitor.addEventListener('dragmove', (event) => {
      const callback = handleDragMove.current;

      if (callback) {
        trackRendering(() => callback(event, manager));
      }
    });
    manager.monitor.addEventListener('dragend', (event) => {
      const callback = handleDragEnd.current;

      if (callback) {
        trackRendering(() => callback(event, manager));
      }
    });
    manager.monitor.addEventListener('collision', (event) =>
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
    <DragDropContext.Provider value={manager as DragDropManager | null}>
      <Renderer ref={rendererRef}>{children}</Renderer>
      {children}
    </DragDropContext.Provider>
  );
}
