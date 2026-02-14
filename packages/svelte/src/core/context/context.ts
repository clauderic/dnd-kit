import {getContext, setContext} from 'svelte';
import type {DragDropManager} from '@dnd-kit/dom';

export const DND_CONTEXT_KEY = Symbol('DragDropProvider');

export function setDragDropContext(manager: DragDropManager) {
  setContext(DND_CONTEXT_KEY, manager);
}

export function getDragDropContext(): DragDropManager {
  const manager = getContext<DragDropManager | undefined>(DND_CONTEXT_KEY);

  if (!manager) {
    throw new Error(
      'getDragDropManager was called outside of a DragDropProvider. ' +
        'Make sure your component is wrapped in a DragDropProvider.'
    );
  }

  return manager;
}
