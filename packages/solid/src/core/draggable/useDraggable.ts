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

  createEffect(
    () => ({
      el: element(),
      h: handle(),
      id: input.id,
      disabled: input.disabled,
      alignment: input.alignment,
      plugins: input.plugins,
      modifiers: input.modifiers,
      sensors: input.sensors,
      data: input.data,
    }),
    ({el, h, id, disabled, alignment, plugins, modifiers, sensors, data}) => {
      if (el) draggable.element = el;
      if (h) draggable.handle = h;

      draggable.id = id;
      draggable.disabled = disabled ?? false;
      draggable.alignment = alignment;
      draggable.plugins = plugins;
      draggable.modifiers = modifiers;
      draggable.sensors = sensors;

      if (data) {
        draggable.data = data;
      }
    }
  );

  return {
    get draggable() {
      return draggable;
    },
    isDragging: () => trackedDraggable().isDragging,
    isDropping: () => trackedDraggable().isDropping,
    isDragSource: () => trackedDraggable().isDragSource,
    ref: setElement,
    handleRef: setHandle,
  };
}
