import {type Data} from '@dnd-kit/abstract';
import type {SortableInput} from '@dnd-kit/dom/sortable';
import {defaultSortableTransition, Sortable} from '@dnd-kit/dom/sortable';
import {batch} from '@dnd-kit/state';
import {useDeepSignal} from '../composables/useDeepSignal.ts';
import {toValueDeep, unrefElement} from '../utilities/index.ts';
import {useInstance} from '../core/hooks/useInstance.ts';
import type {MaybeRefOrGetter} from 'vue';
import {
  computed,
  shallowReadonly,
  toValue,
  watch,
  watchEffect,
} from 'vue';
import type {MaybeElement, MaybeRefsOrGetters} from '../types.ts';

export interface UseSortableInput<T extends Data = Data>
  extends MaybeRefsOrGetters<
    Omit<SortableInput<T>, 'handle' | 'element' | 'source' | 'target'>
  > {
  handle?: MaybeRefOrGetter<MaybeElement>;
  element?: MaybeRefOrGetter<MaybeElement>;
  source?: MaybeRefOrGetter<MaybeElement>;
  target?: MaybeRefOrGetter<MaybeElement>;
}

export function useSortable<T extends Data = Data>(input: UseSortableInput<T>) {
  const transition = computed(() => ({
    ...defaultSortableTransition,
    ...toValue(input.transition),
  }));

  const sortable = useInstance((manager) => {
    const _input = toValueDeep(input);

    return new Sortable(
      {
        ..._input,
        register: false,
        transition: transition.value,
        element: unrefElement(input.element),
        handle: unrefElement(input.handle),
        target: unrefElement(input.target),
      },
      manager
    );
  });
  const trackedSortable = useDeepSignal(sortable);

  watchEffect(() => {
    sortable.value.element = unrefElement(input.element);
    sortable.value.handle = unrefElement(input.handle);

    if (unrefElement(input.source)) {
      sortable.value.source = unrefElement(input.source);
    }
    if (unrefElement(input.target)) {
      sortable.value.target = unrefElement(input.target);
    }

    sortable.value.id = toValue(input.id);
    sortable.value.disabled = toValue(input.disabled) ?? false;
    sortable.value.feedback = toValue(input.feedback) ?? 'default';
    sortable.value.alignment = toValue(input.alignment);
    sortable.value.modifiers = toValue(input.modifiers);
    sortable.value.sensors = toValue(input.sensors);
    sortable.value.accept = toValue(input.accept);
    sortable.value.type = toValue(input.type);
    sortable.value.collisionPriority = toValue(input.collisionPriority);
    sortable.value.transition = transition.value;

    if (toValue(input.data)) {
      sortable.value.data = toValue(input.data)!;
    }
  });

  watch(
    [() => toValue(input.group), () => toValue(input.index)],
    () => {
      batch(() => {
        sortable.value.group = toValue(input.group);
        sortable.value.index = toValue(input.index);
      });
    },
    {flush: 'sync'}
  );

  watch(
    () => toValue(input.index),
    () => {
      if (
        sortable.value.manager?.dragOperation.status.idle &&
        sortable.value.transition?.idle
      ) {
        sortable.value.refreshShape();
      }
    }
  );

  return {
    sortable: shallowReadonly(sortable),
    isDragging: computed(() => trackedSortable.value.isDragging),
    isDropping: computed(() => trackedSortable.value.isDropping),
    isDragSource: computed(() => trackedSortable.value.isDragSource),
    isDropTarget: computed(() => trackedSortable.value.isDropTarget),
  };
}
