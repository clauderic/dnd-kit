import type {Data} from '@dnd-kit/abstract';
import type {DraggableInput} from '@dnd-kit/dom';
import {Draggable} from '@dnd-kit/dom';

import {createDeepSignal} from '../../utilities/createDeepSignal.svelte.js';
import {createInstance} from '../hooks/createInstance.svelte.js';

export type CreateDraggableInput<T extends Data = Data> = Omit<
  DraggableInput<T>,
  'handle' | 'element' | 'register'
>;

export function createDraggable<T extends Data = Data>(
  input: CreateDraggableInput<T>
) {
  const draggable = createInstance(
    (manager) =>
      new Draggable(
        {
          ...input,
          register: false,
        },
        manager
      )
  );

  const tracked = createDeepSignal(() => draggable);

  // Sync reactive properties from input getters
  $effect(() => {
    draggable.id = input.id;
    draggable.disabled = input.disabled ?? false;
    draggable.feedback = input.feedback ?? 'default';
    draggable.alignment = input.alignment;
    draggable.modifiers = input.modifiers;
    draggable.sensors = input.sensors;

    if (input.data) {
      draggable.data = input.data;
    }
  });

  return {
    get draggable() {
      return draggable;
    },
    get isDragging() {
      return tracked.current.isDragging;
    },
    get isDropping() {
      return tracked.current.isDropping;
    },
    get isDragSource() {
      return tracked.current.isDragSource;
    },
    attach(node: HTMLElement) {
      draggable.element = node;

      return () => {
        draggable.element = undefined;
      };
    },
    attachHandle(node: HTMLElement) {
      draggable.handle = node;

      return () => {
        draggable.handle = undefined;
      };
    },
  };
}
