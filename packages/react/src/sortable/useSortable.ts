import {useCallback, useEffect} from 'react';
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
import {getCurrentValue, type RefOrValue} from '@dnd-kit/react/utilities';
import {FeedbackType} from '@dnd-kit/dom';

export interface UseSortableInput<T extends Data = Data>
  extends Omit<SortableInput<T>, 'handle' | 'element' | 'feedback'> {
  handle?: RefOrValue<Element>;
  element?: RefOrValue<Element>;
  feedback?: FeedbackType | (() => React.ReactNode);
}

export function useSortable<T extends Data = Data>(input: UseSortableInput<T>) {
  const {
    accept,
    collisionDetector,
    collisionPriority,
    id,
    data,
    index,
    disabled,
    optimistic,
    sensors,
    transition = defaultSortableTransition,
    type,
  } = input;
  const feedback =
    typeof input.feedback === 'function' ? 'none' : input.feedback;

  const manager = useDragDropManager();

  const handle = getCurrentValue(input.handle);
  const element = getCurrentValue(input.element);
  const sortable = useConstant(
    () =>
      new Sortable(
        {
          ...input,
          handle,
          element,
          feedback,
        },
        manager
      ),
    manager
  );

  const isDisabled = useComputed(() => sortable.disabled);
  const isDropTarget = useComputed(() => sortable.isDropTarget);
  const isDragSource = useComputed(() => sortable.isDragSource);

  useOnValueChange(
    accept,
    () => (sortable.accept = accept),
    undefined,
    deepEqual
  );
  useOnValueChange(type, () => (sortable.type = type));
  useOnValueChange(id, () => (sortable.id = id));
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
  useOnValueChange(index, () => (sortable.index = index), layoutEffect);
  useOnValueChange(handle, () => (sortable.handle = handle));
  useOnValueChange(element, () => (sortable.element = element));
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
  useOnValueChange(
    input.feedback,
    () => (sortable.feedback = feedback ?? 'default')
  );
  useOnValueChange(transition, () => (sortable.transition = transition));
  useOnValueChange(
    optimistic,
    () => (sortable.optimistic = optimistic === true)
  );

  useEffect(() => {
    // Cleanup on unmount
    return sortable.destroy;
  }, [sortable]);

  return {
    get isDisabled() {
      return isDisabled.value;
    },
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
