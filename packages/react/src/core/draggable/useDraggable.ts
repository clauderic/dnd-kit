import {useCallback} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {deepEqual} from '@dnd-kit/state';
import {Draggable} from '@dnd-kit/dom';
import type {DraggableInput} from '@dnd-kit/dom';
import {useComputed, useOnValueChange} from '@dnd-kit/react/hooks';
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
  const {disabled, data, id, modifiers, sensors} = input;
  const handle = currentValue(input.handle);
  const element = currentValue(input.element);
  const draggable = useInstance(
    (manager) =>
      new Draggable(
        {
          ...input,
          handle,
          element,
        },
        manager
      )
  );
  const isDragSource = useComputed(() => draggable.isDragSource, [draggable]);
  const status = useComputed(() => draggable.status, [draggable]);

  useOnValueChange(id, () => (draggable.id = id));
  useOnValueChange(handle, () => (draggable.handle = handle));
  useOnValueChange(element, () => (draggable.element = element));
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
    draggable,
    get isDragSource() {
      return isDragSource.value;
    },
    get status() {
      return status.value;
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
