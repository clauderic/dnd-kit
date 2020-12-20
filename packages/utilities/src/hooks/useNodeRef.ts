import {useRef, useCallback} from 'react';

export function useNodeRef() {
  const node = useRef<HTMLElement | null>(null);
  const setNodeRef = useCallback((element: HTMLElement | null) => {
    node.current = element;
  }, []);

  return [node, setNodeRef] as const;
}
