import {useRef, useCallback} from 'react';

import {useLatestValue} from './useLatestValue';

export function useNodeRef(
  onChange?: (
    newElement: HTMLElement | null,
    previousElement: HTMLElement | null
  ) => void
) {
  const onChangeRef = useLatestValue(onChange);
  const node = useRef<HTMLElement | null>(null);
  const setNodeRef = useCallback(
    (element: HTMLElement | null) => {
      if (element !== node.current) {
        onChangeRef.current?.(element, node.current);
      }

      node.current = element;
    },
    //eslint-disable-next-line
    []
  );

  return [node, setNodeRef] as const;
}
