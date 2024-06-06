import {
  Component,
  forwardRef,
  useImperativeHandle,
  useEffect,
  type PropsWithChildren,
} from 'react';
import {type DragDropEvents} from '@dnd-kit/abstract';
import {DragDropManager, defaultPreset} from '@dnd-kit/dom';
import type {DragDropManagerInput, Draggable, Droppable} from '@dnd-kit/dom';
import {
  useConstant,
  useEvent,
  useLatest,
  useOnValueChange,
} from '@dnd-kit/react/hooks';

import {DragDropContext} from './context.js';
import {useRenderer} from './renderer.js';

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

export const DragDropProvider = forwardRef<DragDropManager, Props>(
  function DragDropProvider(
    {
      children,
      onCollision,
      onBeforeDragStart,
      onDragStart,
      onDragMove,
      onDragOver,
      onDragEnd,
      ...input
    },
    ref
  ) {
    const {renderer, trackRendering} = useRenderer();
    const manager = useConstant(() => {
      const instance = input.manager ?? new DragDropManager(input);
      instance.renderer = renderer;

      return instance;
    });
    const {plugins, modifiers} = input;
    const handleBeforeDragStart = useLatest(onBeforeDragStart);
    const handleDragStart = useEvent(onDragStart);
    const handleDragOver = useLatest(onDragOver);
    const handleDragMove = useLatest(onDragMove);
    const handleDragEnd = useLatest(onDragEnd);
    const handleCollision = useEvent(onCollision);

    useEffect(() => {
      const listeners = [
        manager.monitor.addEventListener(
          'beforedragstart',
          (event, manager) => {
            const callback = handleBeforeDragStart.current;

            if (callback) {
              trackRendering(() => callback(event, manager));
            }
          }
        ),
        manager.monitor.addEventListener('dragstart', handleDragStart),
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
        manager.monitor.addEventListener('collision', handleCollision),
      ];

      return () => {
        listeners.forEach((unsubscribe) => unsubscribe());
      };
    }, [manager]);

    useOnValueChange(
      plugins,
      () => (manager.plugins = plugins ?? defaultPreset.plugins)
    );
    useOnValueChange(modifiers, () => (manager.modifiers = modifiers ?? []));

    useImperativeHandle(ref, () => manager, [manager]);

    return (
      <DragDropContext.Provider value={manager}>
        {children}
        <Lifecycle manager={manager} />
      </DragDropContext.Provider>
    );
  }
);

class Lifecycle extends Component<{manager: DragDropManager}> {
  render() {
    return null;
  }

  componentWillUnmount() {
    this.props.manager.destroy();
  }
}
