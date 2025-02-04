import {useCallback} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {deepEqual} from '@dnd-kit/state';
import {Draggable} from '@dnd-kit/dom';
import type {DraggableInput} from '@dnd-kit/dom';
import {
  useComputed,
  useOnValueChange,
  useOnElementChange,
  useDeepSignal,
} from '@dnd-kit/react/hooks';
import {currentValue, type RefOrValue} from '@dnd-kit/react/utilities';

import {useInstance} from '../hooks/useInstance.ts';

export interface UseDraggableInput<T extends Data = Data>
  extends Omit<DraggableInput<T>, 'handle' | 'element'> {
  handle?: RefOrValue<Element>;
  element?: RefOrValue<Element>;
}

export function useDraggable<T extends Data = Data>(
  input: UseDraggableInput<T>
) {
  const {disabled, data, element, handle, id, modifiers, sensors} = input;
  const draggable = useInstance(
    (manager) =>
      new Draggable(
        {
          ...input,
          register: false,
          handle: currentValue(handle),
          element: currentValue(element),
        },
        manager
      )
  );
  const trackedDraggable = useDeepSignal(draggable, shouldUpdateSynchronously);

  useOnValueChange(id, () => (draggable.id = id));
  useOnElementChange(handle, (handle) => (draggable.handle = handle));
  useOnElementChange(element, (element) => (draggable.element = element));
  useOnValueChange(data, () => data && (draggable.data = data));
  useOnValueChange(disabled, () => (draggable.disabled = disabled === true));
  useOnValueChange(sensors, () => (draggable.sensors = sensors));
  useOnValueChange(
    modifiers,
    () => (draggable.modifiers = modifiers),
    undefined,
    deepEqual
  );
  useOnValueChange(
    input.feedback,
    () => (draggable.feedback = input.feedback ?? 'default')
  );

  return {
    draggable: trackedDraggable,
    get isDragging() {
      return trackedDraggable.isDragging;
    },
    get isDropping() {
      return trackedDraggable.isDropping;
    },
    get isDragSource() {
      return trackedDraggable.isDragSource;
    },
    handleRef: useCallback(
      (element: Element | null) => {
        draggable.handle = element ?? undefined;
      },
      [draggable]
    ),
    ref: useCallback(
      (element: Element | null) => {
        if (
          !element &&
          draggable.element?.isConnected &&
          !draggable.manager?.dragOperation.status.idle
        ) {
          return;
        }

        draggable.element = element ?? undefined;
      },
      [draggable]
    ),
  };
}

function shouldUpdateSynchronously(key: string, oldValue: any, newValue: any) {
  // Update synchronously after drop animation
  if (key === 'isDragSource' && !newValue && oldValue) return true;

  return false;
}
