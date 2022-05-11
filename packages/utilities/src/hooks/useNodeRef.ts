import {useRef, useCallback} from 'react';

import {useEvent} from './useEvent';

export function useNodeRef(
  onChange?: (
    newElement: HTMLElement | null,
    previousElement: HTMLElement | null
  ) => void
) {
  const onChangeHandler = useEvent(onChange);
  const node = useRef<HTMLElement | null>(null);
  const setNodeRef = useCallback(
    (element: HTMLElement | null) => {
      if (element !== node.current) {
        onChangeHandler?.(element, node.current);
      }

      node.current = element;
    },
    //eslint-disable-next-line
    []
  );

  return [node, setNodeRef] as const;
}
