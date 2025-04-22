import type {Data} from '@dnd-kit/abstract';
import type {DroppableInput} from '@dnd-kit/dom';
import {Droppable} from '@dnd-kit/dom';
import {useDeepSignal} from '@dnd-kit/vue/composables';
import {toValueDeep, unrefElement} from '@dnd-kit/vue/utilities';
import {
  computed,
  MaybeRefOrGetter,
  shallowReadonly,
  toValue,
  watchEffect,
} from 'vue';
import type {MaybeElement, MaybeRefsOrGetters} from '../../types.ts';
import {useInstance} from '../composables/useInstance.ts';

export interface UseDroppableInput<T extends Data = Data>
  extends MaybeRefsOrGetters<Omit<DroppableInput<T>, 'element'>> {
  element?: MaybeRefOrGetter<MaybeElement>;
}

export function useDroppable<T extends Data = Data>(
  input: UseDroppableInput<T>
) {
  const droppable = useInstance(
    (manager) =>
      new Droppable(
        {
          ...toValueDeep(input),
          register: false,
          element: unrefElement(input.element) ?? undefined,
        },
        manager
      )
  );
  const trackedDroppable = useDeepSignal(droppable);

  watchEffect(() => {
    droppable.value.element = unrefElement(input.element) ?? undefined;

    droppable.value.id = toValue(input.id);
    droppable.value.accept = toValue(input.accept);
    droppable.value.type = toValue(input.type);
    droppable.value.disabled = toValue(input.disabled) ?? false;

    if (toValue(input.collisionDetector)) {
      droppable.value.collisionDetector = toValue(input.collisionDetector)!;
    }

    if (toValue(input.data)) {
      droppable.value.data = toValue(input.data)!;
    }
  });

  return {
    droppable: shallowReadonly(droppable),
    isDropTarget: computed(() => trackedDroppable.value.isDropTarget),
  };
}
