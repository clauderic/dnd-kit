import {useCallback, useLayoutEffect} from 'react';
import {deepEqual} from '@dnd-kit/state';
import {type Data} from '@dnd-kit/abstract';
import {Sortable, defaultSortableTransition} from '@dnd-kit/dom/sortable';
import type {SortableInput} from '@dnd-kit/dom/sortable';
import {useDragDropManager} from '@dnd-kit/react';
import {
  useComputed,
  useConstant,
  useOnValueChange,
  useImmediateEffect as immediateEffect,
  useIsomorphicLayoutEffect as layoutEffect,
} from '@dnd-kit/react/hooks';
import {currentValue, type RefOrValue} from '@dnd-kit/react/utilities';

export interface UseSortableInput<T extends Data = Data>
  extends Omit<SortableInput<T>, 'handle' | 'element' | 'target'> {
  handle?: RefOrValue<Element>;
  element?: RefOrValue<Element>;
  target?: RefOrValue<Element>;
}

export function useSortable<T extends Data = Data>(input: UseSortableInput<T>) {
  const {
    accept,
    collisionDetector,
    collisionPriority,
    id,
    data,
    index,
    group,
    disabled,
    feedback,
    sensors,
    transition = defaultSortableTransition,
    type,
  } = input;

  const manager = useDragDropManager();
  const handle = currentValue(input.handle);
  const element = currentValue(input.element);
  const target = currentValue(input.target);

  const sortable = useConstant(() => {
    return new Sortable(
      {
        ...input,
        handle,
        element,
        target,
        feedback,
        options: {
          ...input.options,
          register: false,
        },
      },
      manager
    );
  }, manager);

  useLayoutEffect(() => {
    manager.registry.register(sortable.draggable);
    manager.registry.register(sortable.droppable);

    return () => {
      manager.registry.unregister(sortable.draggable);
      manager.registry.unregister(sortable.droppable);
    };
  }, [sortable, manager]);

  const isDropTarget = useComputed(() => sortable.isDropTarget);
  const isDragSource = useComputed(() => sortable.isDragSource);

  useOnValueChange(id, () => (sortable.id = id));
  useOnValueChange(index, () => (sortable.index = index), layoutEffect);
  useOnValueChange(type, () => (sortable.type = type));
  useOnValueChange(group, () => (sortable.group = group));
  useOnValueChange(
    accept,
    () => (sortable.accept = accept),
    undefined,
    deepEqual
  );
  useOnValueChange(data, () => (sortable.data = data ?? null));
  useOnValueChange(
    index,
    () => {
      if (manager.dragOperation.status.idle && transition) {
        sortable.refreshShape();
      }
    },
    immediateEffect
  );
  useOnValueChange(handle, () => (sortable.handle = handle));
  useOnValueChange(element, () => (sortable.element = element));
  useOnValueChange(target, () => (sortable.target = target));
  useOnValueChange(disabled, () => (sortable.disabled = disabled === true));
  useOnValueChange(sensors, () => (sortable.sensors = sensors));
  useOnValueChange(
    collisionDetector,
    () => (sortable.collisionDetector = collisionDetector)
  );
  useOnValueChange(
    collisionPriority,
    () => (sortable.collisionPriority = collisionPriority)
  );
  useOnValueChange(feedback, () => (sortable.feedback = feedback ?? 'default'));
  useOnValueChange(transition, () => (sortable.transition = transition));

  return {
    get isDragSource() {
      return isDragSource.value;
    },
    get isDropTarget() {
      return isDropTarget.value;
    },
    handleRef: useCallback(
      (element: Element | null) => {
        sortable.handle = element ?? undefined;
      },
      [sortable]
    ),
    ref: useCallback(
      (element: Element | null) => {
        sortable.element = element ?? undefined;
      },
      [sortable]
    ),
    sourceRef: useCallback(
      (element: Element | null) => {
        sortable.source = element ?? undefined;
      },
      [sortable]
    ),
    targetRef: useCallback(
      (element: Element | null) => {
        sortable.target = element ?? undefined;
      },
      [sortable]
    ),
  };
}
