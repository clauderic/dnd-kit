import type {Data} from '@dnd-kit/abstract';
import type {DraggableInput} from '@dnd-kit/dom';
import {Draggable} from '@dnd-kit/dom';
import {useDeepSignal} from '../../composables/useDeepSignal.ts';
import {toValueDeep, unrefElement} from '../../utilities/index.ts';
import type {MaybeRefOrGetter} from 'vue';
import {computed, shallowReadonly, toValue, watchEffect} from 'vue';
import type {MaybeElement, MaybeRefsOrGetters} from '../../types.ts';
import {useInstance} from '../hooks/useInstance.ts';

export interface UseDraggableInput<T extends Data = Data>
  extends MaybeRefsOrGetters<Omit<DraggableInput<T>, 'handle' | 'element'>> {
  handle?: MaybeRefOrGetter<MaybeElement>;
  element?: MaybeRefOrGetter<MaybeElement>;
}

export function useDraggable<T extends Data = Data>(
  input: UseDraggableInput<T>
) {
  const draggable = useInstance(
    (manager) =>
      new Draggable(
        {
          ...toValueDeep(input),
          register: false,
          element: unrefElement(input.element) ?? undefined,
          handle: unrefElement(input.handle) ?? undefined,
        },
        manager
      )
  );
  const trackedDraggable = useDeepSignal(draggable);

  watchEffect(() => {
    draggable.value.element = unrefElement(input.element) ?? undefined;
    draggable.value.handle = unrefElement(input.handle) ?? undefined;

    draggable.value.id = toValue(input.id);
    draggable.value.disabled = toValue(input.disabled) ?? false;
    draggable.value.feedback = toValue(input.feedback) ?? 'default';
    draggable.value.alignment = toValue(input.alignment);
    draggable.value.modifiers = toValue(input.modifiers);
    draggable.value.sensors = toValue(input.sensors);

    if (toValue(input.data)) {
      draggable.value.data = toValue(input.data)!;
    }
  });

  return {
    draggable: shallowReadonly(draggable),
    isDragging: computed(() => trackedDraggable.value.isDragging),
    isDropping: computed(() => trackedDraggable.value.isDropping),
    isDragSource: computed(() => trackedDraggable.value.isDragSource),
  };
}
