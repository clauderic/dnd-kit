import {type Data} from '@dnd-kit/abstract';
import type {SortableInput} from '@dnd-kit/dom/sortable';
import {resolveSortableTransition, Sortable} from '@dnd-kit/dom/sortable';
import {batch} from '@dnd-kit/state';
import {createEffect, createSignal} from 'solid-js';

import {useDeepSignal} from '@dnd-kit/solid/hooks';
import {useInstance} from '@dnd-kit/solid';

export interface UseSortableInput<T extends Data = Data>
  extends Omit<SortableInput<T>, 'handle' | 'element' | 'source' | 'target'> {
  handle?: Element;
  element?: Element;
  source?: Element;
  target?: Element;
}

export function useSortable<T extends Data = Data>(
  input: UseSortableInput<T>
) {
  const transition = resolveSortableTransition(input.transition);

  const sortable = useInstance((manager) => {
    return new Sortable(
      {
        ...input,
        register: false,
        transition,
        element: input.element,
        handle: input.handle,
        target: input.target,
      },
      manager
    );
  });
  const trackedSortable = useDeepSignal(() => sortable);

  const [element, setElement] = createSignal<Element | undefined>(
    input.element
  );
  const [handle, setHandle] = createSignal<Element | undefined>(input.handle);
  const [source, setSource] = createSignal<Element | undefined>(input.source);
  const [target, setTarget] = createSignal<Element | undefined>(input.target);

  createEffect(
    () => ({
      el: element(),
      h: handle(),
      s: source(),
      t: target(),
      id: input.id,
      disabled: input.disabled,
      alignment: input.alignment,
      plugins: input.plugins,
      modifiers: input.modifiers,
      sensors: input.sensors,
      accept: input.accept,
      type: input.type,
      collisionPriority: input.collisionPriority,
      transition: input.transition,
      collisionDetector: input.collisionDetector,
      data: input.data,
    }),
    ({
      el,
      h,
      s,
      t,
      id,
      disabled,
      alignment,
      plugins,
      modifiers,
      sensors,
      accept,
      type,
      collisionPriority,
      transition,
      collisionDetector,
      data,
    }) => {
      if (el) sortable.element = el;
      if (h) sortable.handle = h;
      if (s) sortable.source = s;
      if (t) sortable.target = t;

      sortable.id = id;
      sortable.disabled = disabled ?? false;
      sortable.alignment = alignment;
      sortable.plugins = plugins;
      sortable.modifiers = modifiers;
      sortable.sensors = sensors;
      sortable.accept = accept;
      sortable.type = type;
      sortable.collisionPriority = collisionPriority;
      sortable.transition = resolveSortableTransition(transition);

      if (collisionDetector) {
        sortable.collisionDetector = collisionDetector;
      }

      if (data) {
        sortable.data = data;
      }
    }
  );

  // Batch group + index updates
  createEffect(
    () => ({group: input.group, index: input.index}),
    ({group, index}) => {
      batch(() => {
        sortable.group = group;
        sortable.index = index;
      });
    }
  );

  // Refresh shape when index changes while idle
  createEffect(
    () => input.index,
    () => {
      if (
        sortable.manager?.dragOperation.status.idle &&
        sortable.transition?.idle
      ) {
        sortable.refreshShape();
      }
    }
  );

  return {
    get sortable() {
      return sortable;
    },
    isDragging: () => trackedSortable().isDragging,
    isDropping: () => trackedSortable().isDropping,
    isDragSource: () => trackedSortable().isDragSource,
    isDropTarget: () => trackedSortable().isDropTarget,
    ref: setElement,
    handleRef: setHandle,
    sourceRef: setSource,
    targetRef: setTarget,
  };
}
