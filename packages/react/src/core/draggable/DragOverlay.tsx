import {createElement, useEffect, useMemo, useRef, type ReactNode} from 'react';
import {useComputed, useDeepSignal} from '@dnd-kit/react/hooks';
import {Draggable, Feedback} from '@dnd-kit/dom';

import {useDragDropManager} from '../hooks/useDragDropManager.ts';
import {DragDropContext} from '../context/context.ts';

export interface Props {
  className?: string;
  children: ReactNode | ((source: Draggable) => ReactNode);
  style?: React.CSSProperties;
  tag?: string;
}

export function DragOverlay({children, className, style, tag}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const manager = useDragDropManager();
  const source = useComputed(
    () => manager?.dragOperation.source,
    [manager]
  ).value;

  useEffect(() => {
    if (!ref.current || !manager) return;

    const feedback = manager.plugins.find(
      (plugin) => plugin instanceof Feedback
    );

    if (!feedback) return;

    feedback.overlay = ref.current;

    return () => {
      feedback.overlay = undefined;
    };
  }, [manager]);

  // Prevent children of the overlay from registering themselves as draggables or droppables
  const patchedManager = useMemo(() => {
    if (!manager) return null;

    const patchedRegistry = new Proxy(manager.registry, {
      get(target, property) {
        if (property === 'register' || property === 'unregister') {
          return noop;
        }

        return target[property as keyof typeof target];
      },
    });

    return new Proxy(manager, {
      get(target, property) {
        if (property === 'registry') {
          return patchedRegistry;
        }

        return target[property as keyof typeof target];
      },
    });
  }, [manager]);

  return (
    <DragDropContext.Provider value={patchedManager}>
      {createElement(
        tag || 'div',
        {ref, className, style, 'data-dnd-overlay': true},

        renderChildren()
      )}
    </DragDropContext.Provider>
  );

  function renderChildren() {
    if (!source) return null;

    if (typeof children === 'function') {
      return <Children source={source}>{children}</Children>;
    }

    return children;
  }
}

function noop() {
  return () => {};
}

function Children({
  children,
  source,
}: {
  children: (source: Draggable) => ReactNode;
  source: Draggable;
}) {
  return children(useDeepSignal(source));
}
