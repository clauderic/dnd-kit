import {useEffect, type PropsWithChildren} from 'react';
import type {DragDropEvents} from '@dnd-kit/abstract';
import {DragDropManager, defaultPreset} from '@dnd-kit/dom';
import type {DragDropManagerInput, Draggable, Droppable} from '@dnd-kit/dom';
import {useConstant, useLatest, useOnValueChange} from '@dnd-kit/react/hooks';

import {DragDropContext} from './context.ts';
import {useRenderer} from './renderer.ts';
import {Lifecycle} from './lifecycle.ts';

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

export default function DragDropProvider({
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
  const createManager = () => {
    const instance = input.manager ?? new DragDropManager(input);
    instance.renderer = renderer;
    return instance;
  };
  const manager = useConstant<DragDropManager>(createManager);
  const {plugins, modifiers, sensors} = input;
  const handleBeforeDragStart = useLatest(onBeforeDragStart);
  const handleDragStart = useLatest(onDragStart);
  const handleDragOver = useLatest(onDragOver);
  const handleDragMove = useLatest(onDragMove);
  const handleDragEnd = useLatest(onDragEnd);
  const handleCollision = useLatest(onCollision);

  useEffect(() => {
    const listeners = [
      manager.monitor.addEventListener('beforedragstart', (event, manager) => {
        const callback = handleBeforeDragStart.current;

        if (callback) {
          trackRendering(() => callback(event, manager));
        }
      }),
      manager.monitor.addEventListener('dragstart', (event, manager) =>
        handleDragStart.current?.(event, manager)
      ),
      manager.monitor.addEventListener('dragover', (event, manager) => {
        const callback = handleDragOver.current;

        if (callback) {
          trackRendering(() => callback(event, manager));
        }
      }),
      manager.monitor.addEventListener('dragmove', (event, manager) => {
        const callback = handleDragMove.current;

        if (callback) {
          trackRendering(() => callback(event, manager));
        }
      }),
      manager.monitor.addEventListener('dragend', (event, manager) => {
        const callback = handleDragEnd.current;

        if (callback) {
          trackRendering(() => callback(event, manager));
        }
      }),
      manager.monitor.addEventListener('collision', (event, manager) =>
        handleCollision.current?.(event, manager)
      ),
    ];

    return () => {
      listeners.forEach((dispose) => dispose());
    };
  }, []);

  useOnValueChange(
    plugins,
    () => (manager.plugins = plugins ?? defaultPreset.plugins)
  );
  useOnValueChange(
    sensors,
    () => (manager.sensors = sensors ?? defaultPreset.sensors)
  );
  useOnValueChange(modifiers, () => (manager.modifiers = modifiers ?? []));

  return (
    <DragDropContext.Provider value={manager}>
      <Lifecycle manager={manager} />
      {children}
    </DragDropContext.Provider>
  );
}
