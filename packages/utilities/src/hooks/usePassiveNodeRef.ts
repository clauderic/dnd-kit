import {useRef, useCallback} from 'react';

export function usePassiveNodeRef() {
  const node = useRef<HTMLElement | null>(null);
  const setNodeRef = useCallback(
    (element: HTMLElement | null) => {
      node.current = element;
    },
    //eslint-disable-next-line
    []
  );

  return [node, setNodeRef] as const;
}
