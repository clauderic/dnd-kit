import {createElement, useEffect, useMemo, useRef, type ReactNode} from 'react';
import {useComputed, useDeepSignal} from '@dnd-kit/react/hooks';
import {DragDropManager, Draggable, Feedback} from '@dnd-kit/dom';
import type {DropAnimation} from '@dnd-kit/dom';
import {Data} from '@dnd-kit/abstract';

import {useDragDropManager} from '../hooks/useDragDropManager.ts';
import {DragDropContext} from '../context/context.ts';

export interface Props<T extends Data, U extends Draggable<T>> {
  className?: string;
  children: ReactNode | ((source: U) => ReactNode);
  /**
   * Customize or disable the drop animation that plays when a drag operation ends.
   *
   * - `undefined` – use the default animation (250ms ease)
   * - `null` – disable the drop animation entirely
   * - `{duration, easing}` – customize the animation timing
   * - `(context) => Promise<void> | void` – provide a fully custom animation function
   */
  dropAnimation?: DropAnimation | null;
  style?: React.CSSProperties;
  tag?: string;
  disabled?: boolean | ((source: U | null) => boolean);
}

export function DragOverlay<T extends Data, U extends Draggable<T>>({
  children,
  className,
  dropAnimation,
  style,
  tag,
  disabled,
}: Props<T, U>) {
  const ref = useRef<HTMLDivElement | null>(null);
  const manager = useDragDropManager<T, U>();
  const source =
    useComputed(() => manager?.dragOperation.source, [manager]).value ?? null;
  const isDisabled =
    typeof disabled === 'function' ? disabled(source) : disabled;

  useEffect(() => {
    if (!ref.current || !manager || isDisabled) return;

    const feedback = manager.plugins.find(
      (plugin) => plugin instanceof Feedback
    );

    if (!feedback) return;

    feedback.overlay = ref.current;

    return () => {
      feedback.overlay = undefined;
    };
  }, [manager, isDisabled]);

  useEffect(() => {
    if (!manager) return;

    const feedback = manager.plugins.find(
      (plugin) => plugin instanceof Feedback
    );

    if (!feedback) return;

    feedback.dropAnimation = dropAnimation;

    return () => {
      feedback.dropAnimation = undefined;
    };
  }, [manager, dropAnimation]);

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
    <DragDropContext.Provider value={patchedManager as DragDropManager | null}>
      {createElement(
        tag || 'div',
        {ref, className, style, 'data-dnd-overlay': true},

        renderChildren()
      )}
    </DragDropContext.Provider>
  );

  function renderChildren() {
    if (!source || isDisabled) return null;

    if (typeof children === 'function') {
      return <Children source={source}>{children}</Children>;
    }

    return children;
  }
}

function noop() {
  return () => {};
}

function Children<T extends Data, U extends Draggable<T>>({
  children,
  source,
}: {
  children: (source: U) => ReactNode;
  source: U;
}) {
  return children(useDeepSignal(source));
}
