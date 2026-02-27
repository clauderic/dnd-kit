import {type Data} from '@dnd-kit/abstract';
import type {SortableInput} from '@dnd-kit/dom/sortable';
import {defaultSortableTransition, Sortable} from '@dnd-kit/dom/sortable';
import {batch} from '@dnd-kit/state';
import {createEffect, createSignal, on} from 'solid-js';

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
  const transition = {
    ...defaultSortableTransition,
    ...input.transition,
  };

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

  createEffect(() => {
    const el = element();
    if (el) sortable.element = el;

    const h = handle();
    if (h) sortable.handle = h;

    const s = source();
    if (s) sortable.source = s;

    const t = target();
    if (t) sortable.target = t;

    sortable.id = input.id;
    sortable.disabled = input.disabled ?? false;
    sortable.alignment = input.alignment;
    sortable.plugins = input.plugins;
    sortable.modifiers = input.modifiers;
    sortable.sensors = input.sensors;
    sortable.accept = input.accept;
    sortable.type = input.type;
    sortable.collisionPriority = input.collisionPriority;
    sortable.transition = input.transition
      ? {...defaultSortableTransition, ...input.transition}
      : defaultSortableTransition;

    if (input.collisionDetector) {
      sortable.collisionDetector = input.collisionDetector;
    }

    if (input.data) {
      sortable.data = input.data;
    }
  });

  // Batch group + index updates
  createEffect(
    on(
      () => [input.group, input.index],
      () => {
        batch(() => {
          sortable.group = input.group;
          sortable.index = input.index;
        });
      }
    )
  );

  // Refresh shape when index changes while idle
  createEffect(
    on(
      () => input.index,
      () => {
        if (
          sortable.manager?.dragOperation.status.idle &&
          sortable.transition?.idle
        ) {
          sortable.refreshShape();
        }
      }
    )
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
