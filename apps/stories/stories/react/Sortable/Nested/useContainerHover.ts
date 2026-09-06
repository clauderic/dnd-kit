import {useCallback, useEffect, useRef, useState} from 'react';
import type {DragDropManager} from '@dnd-kit/dom';
import {isKeyboardEvent} from '@dnd-kit/dom/utilities';
import type {DragDropEventHandlers} from '@dnd-kit/react';

import {locate, type BoardNode} from './tree.ts';

export const TRANSFER_DELAY = 500;

export interface ContainerHover {
  parent: string | null;
}

/** A presentation choice for this story; collision detection stays live. */
export function useContainerHover(
  items: {readonly current: BoardNode[]},
  delay: number
) {
  const [preview, setPreview] = useState<ContainerHover | null>(null);
  const active = useRef(false);
  const pending = useRef<{
    parent: string | null;
    ready: boolean;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);

  const clear = useCallback(() => {
    if (!pending.current) return;
    clearTimeout(pending.current.timer);
    pending.current = null;
    setPreview(null);
  }, []);

  const end = useCallback(() => {
    active.current = false;
    clear();
  }, [clear]);

  useEffect(() => {
    // Release must cancel the preview before normal drop reconciliation.
    window.addEventListener('pointerup', end, true);
    window.addEventListener('pointercancel', end, true);
    return () => {
      window.removeEventListener('pointerup', end, true);
      window.removeEventListener('pointercancel', end, true);
      if (pending.current) clearTimeout(pending.current.timer);
    };
  }, [end]);

  const collision: DragDropEventHandlers['onCollision'] = (event, manager) => {
    const {source, controller, activatorEvent} = manager.dragOperation;
    if (!source || !controller || isKeyboardEvent(activatorEvent) || delay <= 0)
      return;

    const id = event.collisions[0]?.id;
    const target = id == null ? undefined : String(id);
    const from = locate(items.current, String(source.id));
    const parent = target?.startsWith('contents:')
      ? target.slice('contents:'.length)
      : target === 'board'
        ? null
        : target
          ? locate(items.current, target)?.parent
          : undefined;

    if (
      !from ||
      parent === undefined ||
      parent === from.parent ||
      parent === from.node.id ||
      (parent && locate(from.node.children ?? [], parent))
    ) {
      clear();
      return;
    }

    if (!active.current) {
      event.preventDefault();
      return;
    }
    if (pending.current?.parent === parent && pending.current.ready) return;

    event.preventDefault();
    if (pending.current?.parent === parent) return;
    clear();

    const next = {
      parent,
      ready: false,
      timer: setTimeout(() => {
        if (
          pending.current !== next ||
          !active.current ||
          controller.signal.aborted ||
          manager.dragOperation.controller !== controller ||
          !manager.dragOperation.status.dragging
        )
          return;
        next.ready = true;
        // Recheck the latest winner, then let the normal target action own
        // placement and rendering. Never apply a saved target or tree here.
        manager.collisionObserver.forceUpdate();
      }, delay),
    };
    pending.current = next;
    setPreview({parent});
  };

  return {
    preview,
    collision,
    clear,
    end,
    start(manager: DragDropManager) {
      clear();
      active.current = !isKeyboardEvent(manager.dragOperation.activatorEvent);
    },
  };
}
