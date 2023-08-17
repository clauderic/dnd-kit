import {
  forwardRef,
  useTransition,
  useImperativeHandle,
  useEffect,
  useState,
  useRef,
  type PropsWithChildren,
} from 'react';
import {type DragDropEvents} from '@dnd-kit/abstract';
import {DragDropManager, defaultPreset} from '@dnd-kit/dom';
import type {DragDropManagerInput, Draggable, Droppable} from '@dnd-kit/dom';

import {useConstant, useEvent, useOnValueChange} from '../hooks';

import {DragDropContext} from './context';

type Events = DragDropEvents<Draggable, Droppable, DragDropManager>;

export interface Props extends DragDropManagerInput, PropsWithChildren {
  onCollision?: Events['collision'];
  onDragStart?: Events['dragstart'];
  onDragOver?: Events['dragover'];
  onDragEnd?: Events['dragend'];
}

function useRenderer() {
  const [_, startTransition] = useTransition();
  const [transitionCount, setTransitionCount] = useState(0);
  const rendering = useRef<Promise<void>>();
  const resolver = useRef<() => void>();
  const renderer = useConstant(() => ({
    get rendering() {
      return rendering.current ?? false;
    },
  }));

  useOnValueChange(transitionCount, () => {
    resolver.current?.();
    rendering.current = undefined;
  });

  return {
    renderer,
    startTracking(callback: () => void) {
      if (!rendering.current) {
        rendering.current = new Promise<void>((resolve) => {
          resolver.current = resolve;
        });
      }

      startTransition(() => {
        callback();
        setTransitionCount((count) => count + 1);
      });
    },
  };
}

const DragDropProvider = forwardRef<DragDropManager, Props>(
  function DragDropProvider(
    {children, onCollision, onDragStart, onDragOver, onDragEnd, ...input},
    ref
  ) {
    const {renderer, startTracking} = useRenderer();
    const manager = useConstant(
      () => new DragDropManager({...input, renderer})
    );
    const {plugins} = input;
    const handleDragStart = useEvent(onDragStart);
    const handleDragOver = useEvent(onDragOver);
    const handleDragEnd = useEvent(onDragEnd);
    const handleCollision = useEvent(onCollision);

    useEffect(() => {
      manager.monitor.addEventListener('dragstart', handleDragStart);
      manager.monitor.addEventListener('dragover', (event, manager) => {
        startTracking(() => {
          handleDragOver(event, manager);
        });
      });
      manager.monitor.addEventListener('dragend', (event, manager) => {
        startTracking(() => {
          handleDragEnd(event, manager);
        });
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

export default DragDropProvider;
