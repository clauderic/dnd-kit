import type {Data} from '@dnd-kit/abstract';
import type {DraggableInput} from '@dnd-kit/dom';
import {Draggable} from '@dnd-kit/dom';
import {createEffect, createSignal} from 'solid-js';

import {useDeepSignal} from '../../hooks/useDeepSignal.ts';
import {useInstance} from '../hooks/useInstance.ts';

export interface UseDraggableInput<T extends Data = Data>
  extends Omit<DraggableInput<T>, 'handle' | 'element'> {
  handle?: Element;
  element?: Element;
}

export function useDraggable<T extends Data = Data>(
  input: UseDraggableInput<T>
) {
  const draggable = useInstance(
    (manager) =>
      new Draggable(
        {
          ...input,
          register: false,
          element: input.element,
          handle: input.handle,
        },
        manager
      )
  );
  const trackedDraggable = useDeepSignal(() => draggable);

  const [element, setElement] = createSignal<Element | undefined>(
    input.element
  );
  const [handle, setHandle] = createSignal<Element | undefined>(input.handle);

  createEffect(() => {
    const el = element();
    if (el) draggable.element = el;

    const h = handle();
    if (h) draggable.handle = h;

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
      return trackedDraggable().isDragging;
    },
    get isDropping() {
      return trackedDraggable().isDropping;
    },
    get isDragSource() {
      return trackedDraggable().isDragSource;
    },
    ref: setElement,
    handleRef: setHandle,
  };
}
