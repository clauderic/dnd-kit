import {createEffect, createMemo, onCleanup} from 'solid-js';
import {DragDropManager, defaultPreset} from '@dnd-kit/dom';
import {isSortable} from '@dnd-kit/dom/sortable';

import {DragDropContext} from './context.ts';
import {useRenderer} from './renderer.ts';
import {createSaveElementPosition} from '../../utilities/saveElementPosition.ts';

import type {DragDropEvents} from '@dnd-kit/abstract';
import type {DragDropManagerInput, Draggable, Droppable} from '@dnd-kit/dom';
import type {ParentProps} from 'solid-js';

export type Events = DragDropEvents<Draggable, Droppable, DragDropManager>;

export interface DragDropProviderProps
  extends DragDropManagerInput,
    ParentProps {
  manager?: DragDropManager;
  onBeforeDragStart?: Events['beforedragstart'];
  onCollision?: Events['collision'];
  onDragStart?: Events['dragstart'];
  onDragMove?: Events['dragmove'];
  onDragOver?: Events['dragover'];
  onDragEnd?: Events['dragend'];
}

export function DragDropProvider(props: DragDropProviderProps) {
  const {savePosition, restorePosition, clearPosition} = createSaveElementPosition();
  const {renderer, trackRendering} = useRenderer();
  const manager = createMemo(
    () => props.manager ?? new DragDropManager(props)
  );

  onCleanup(() => {
    if (!props.manager) {
      manager().destroy();
    }
  });

  createEffect(() => {
    const _manager = manager();

    _manager.renderer = renderer;
    _manager.plugins = props.plugins ?? defaultPreset.plugins;
    _manager.sensors = props.sensors ?? defaultPreset.sensors;
    _manager.modifiers = props.modifiers ?? defaultPreset.modifiers;
  });

  createEffect(() => {
    const disposers: (() => void)[] = [];
    const monitor = manager().monitor;

    disposers.push(
      monitor.addEventListener('beforedragstart', (event, manager) => {
        if (isSortable(event.operation.source)) {
          savePosition(event.operation.source);
        }

        const callback = props.onBeforeDragStart;
        if (callback) {
          trackRendering(() => callback(event, manager));
        }
      }),
      monitor.addEventListener('dragstart', (event, manager) => {
        props.onDragStart?.(event, manager);
      }),
      monitor.addEventListener('dragover', (event, manager) => {
        const callback = props.onDragOver;
        if (callback) {
          trackRendering(() => callback(event, manager));


          // Update saved position to match what Solid just rendered.
          if (isSortable(event.operation.source)) {
            const source = event.operation.source;

            queueMicrotask(() => savePosition(source));
          }
        }
      }),
      monitor.addEventListener('dragmove', (event, manager) => {
        const callback = props.onDragMove;
        if (callback) {
          trackRendering(() => callback(event, manager));
        }
      }),
      monitor.addEventListener('dragend', (event, manager) => {
        if (isSortable(event.operation.source)) {
          restorePosition(event.operation.source!.element!);
        }

        const callback = props.onDragEnd;
        if (callback) {
          trackRendering(() => callback(event, manager));
        }

        clearPosition();
      }),
      monitor.addEventListener('collision', (event, manager) => {
        props.onCollision?.(event, manager);
      })
    );

    onCleanup(() => {
      disposers.forEach((cleanup) => cleanup());
    });
  });

  return (
    <DragDropContext.Provider value={manager()}>
      {props.children}
    </DragDropContext.Provider>
  );
}
