import type {Data} from '@dnd-kit/abstract';
import type {DroppableInput} from '@dnd-kit/dom';
import {Droppable} from '@dnd-kit/dom';

import {createDeepSignal} from '../../utilities/createDeepSignal.svelte.js';
import {createInstance} from '../hooks/createInstance.svelte.js';

export type CreateDroppableInput<T extends Data = Data> = Omit<
  DroppableInput<T>,
  'element' | 'register'
>;

export function createDroppable<T extends Data = Data>(
  input: CreateDroppableInput<T>
) {
  const droppable = createInstance(
    (manager) =>
      new Droppable(
        {
          ...input,
          register: false,
        },
        manager
      )
  );

  const tracked = createDeepSignal(() => droppable);

  // Sync reactive properties from input getters
  $effect(() => {
    droppable.id = input.id;
    droppable.accept = input.accept;
    droppable.type = input.type;
    droppable.disabled = input.disabled ?? false;

    if (input.collisionDetector) {
      droppable.collisionDetector = input.collisionDetector;
    }

    if (input.data) {
      droppable.data = input.data;
    }
  });

  return {
    get droppable() {
      return droppable;
    },
    get isDropTarget() {
      return tracked.current.isDropTarget;
    },
    attach(node: HTMLElement) {
      droppable.element = node;

      return () => {
        droppable.element = undefined;
      };
    },
  };
}
