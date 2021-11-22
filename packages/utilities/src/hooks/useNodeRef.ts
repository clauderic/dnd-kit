import {useRef, useCallback} from 'react';

export function useNodeRef(onChange?: (element: HTMLElement | null) => void) {
  const node = useRef<HTMLElement | null>(null);
  const setNodeRef = useCallback(
    (element: HTMLElement | null) => {
      node.current = element;
      onChange?.(element);
    },
    [onChange]
  );

  return [node, setNodeRef] as const;
}
