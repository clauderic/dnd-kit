import {createEffect, createMemo, onCleanup, omit} from 'solid-js';
import {DragDropManager, defaultPreset, resolveCustomizable} from '@dnd-kit/dom';
import {isSortable} from '@dnd-kit/dom/sortable';

import {DragDropContext} from './context.ts';
import {useRenderer} from './renderer.ts';
import {createSaveElementPosition} from '../../utilities/saveElementPosition.ts';

import type {DragDropEventHandlers} from '@dnd-kit/abstract';
import type {DragDropManagerInput, Draggable, Droppable} from '@dnd-kit/dom';
import type {ParentProps} from 'solid-js';

export type Events = DragDropEventHandlers<Draggable, Droppable, DragDropManager>;

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
  // Strip `children` before forwarding props to `DragDropManager`. The manager
  // constructor spreads its input (`{...input}`) which would otherwise invoke
  // Solid's `children` getter and synthesize an orphan component subtree on
  // every memo recomputation. See #2015.
  const managerProps = omit(props, 'children');
  const manager = createMemo(
    () => props.manager ?? new DragDropManager(managerProps)
  );

  onCleanup(() => {
    if (!props.manager) {
      manager().destroy();
    }
  });

  createEffect(
    () => ({
      manager: manager(),
      plugins: props.plugins,
      sensors: props.sensors,
      modifiers: props.modifiers,
    }),
    ({manager, plugins, sensors, modifiers}) => {
      manager.renderer = renderer;
      manager.plugins = resolveCustomizable(plugins, defaultPreset.plugins);
      manager.sensors = resolveCustomizable(sensors, defaultPreset.sensors);
      manager.modifiers = resolveCustomizable(
        modifiers,
        defaultPreset.modifiers
      );
    }
  );

  createEffect(
    () => manager().monitor,
    (monitor) => {
      const disposers: (() => void)[] = [];

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

      return () => disposers.forEach((cleanup) => cleanup());
    }
  );

  return (
    <DragDropContext value={manager()}>{props.children}</DragDropContext>
  );
}
