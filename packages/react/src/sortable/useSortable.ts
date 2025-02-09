import {useCallback} from 'react';
import {batch, deepEqual} from '@dnd-kit/state';
import {type Data} from '@dnd-kit/abstract';
import {Sortable, defaultSortableTransition} from '@dnd-kit/dom/sortable';
import type {SortableInput} from '@dnd-kit/dom/sortable';
import {useInstance} from '@dnd-kit/react';
import {
  useImmediateEffect as immediateEffect,
  useIsomorphicLayoutEffect,
  useOnValueChange,
  useOnElementChange,
  useDeepSignal,
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
    element,
    handle,
    index,
    group,
    disabled,
    feedback,
    modifiers,
    sensors,
    target,
    type,
  } = input;
  const transition = {...defaultSortableTransition, ...input.transition};
  const sortable = useInstance((manager) => {
    return new Sortable(
      {
        ...input,
        transition,
        register: false,
        handle: currentValue(handle),
        element: currentValue(element),
        target: currentValue(target),
        feedback,
      },
      manager
    );
  });

  const trackedSortable = useDeepSignal(sortable, shouldUpdateSynchronously);

  useOnValueChange(id, () => (sortable.id = id));

  useIsomorphicLayoutEffect(() => {
    batch(() => {
      sortable.group = group;
      sortable.index = index;
    });
  }, [sortable, group, index]);

  useOnValueChange(type, () => (sortable.type = type));
  useOnValueChange(
    accept,
    () => (sortable.accept = accept),
    undefined,
    deepEqual
  );
  useOnValueChange(data, () => data && (sortable.data = data));
  useOnValueChange(
    index,
    () => {
      if (sortable.manager?.dragOperation.status.idle && transition?.idle) {
        sortable.refreshShape();
      }
    },
    immediateEffect
  );
  useOnElementChange(handle, (handle) => (sortable.handle = handle));
  useOnElementChange(element, (element) => (sortable.element = element));
  useOnElementChange(target, (target) => (sortable.target = target));
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
  useOnValueChange(
    transition,
    () => (sortable.transition = transition),
    undefined,
    deepEqual
  );
  useOnValueChange(
    modifiers,
    () => (sortable.modifiers = modifiers),
    undefined,
    deepEqual
  );
  useOnValueChange(
    input.alignment,
    () => (sortable.alignment = input.alignment)
  );

  return {
    sortable: trackedSortable,
    get isDragging() {
      return trackedSortable.isDragging;
    },
    get isDropping() {
      return trackedSortable.isDropping;
    },
    get isDragSource() {
      return trackedSortable.isDragSource;
    },
    get isDropTarget() {
      return trackedSortable.isDropTarget;
    },
    handleRef: useCallback(
      (element: Element | null) => {
        sortable.handle = element ?? undefined;
      },
      [sortable]
    ),
    ref: useCallback(
      (element: Element | null) => {
        if (
          !element &&
          sortable.element?.isConnected &&
          !sortable.manager?.dragOperation.status.idle
        ) {
          return;
        }

        sortable.element = element ?? undefined;
      },
      [sortable]
    ),
    sourceRef: useCallback(
      (element: Element | null) => {
        if (
          !element &&
          sortable.source?.isConnected &&
          !sortable.manager?.dragOperation.status.idle
        ) {
          return;
        }

        sortable.source = element ?? undefined;
      },
      [sortable]
    ),
    targetRef: useCallback(
      (element: Element | null) => {
        if (
          !element &&
          sortable.target?.isConnected &&
          !sortable.manager?.dragOperation.status.idle
        ) {
          return;
        }

        sortable.target = element ?? undefined;
      },
      [sortable]
    ),
  };
}

function shouldUpdateSynchronously(key: string, oldValue: any, newValue: any) {
  // Update synchronously after drop animation
  if (key === 'isDragSource' && !newValue && oldValue) return true;

  return false;
}
