import {useRef, useCallback} from 'react';

export function useNodeRef(
  onChange?: (
    newElement: HTMLElement | null,
    previousElement: HTMLElement | null
  ) => void
) {
  const node = useRef<HTMLElement | null>(null);
  const setNodeRef = useCallback(
    (element: HTMLElement | null) => {
      onChange?.(element, node.current);
      node.current = element;
    },
    [onChange]
  );

  return [node, setNodeRef] as const;
}
