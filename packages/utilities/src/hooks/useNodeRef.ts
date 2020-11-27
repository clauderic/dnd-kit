import {useRef, useCallback} from 'react';

interface Arguments {
  onChange?(node: HTMLElement): void;
}

export function useNodeRef({onChange}: Arguments = {}) {
  const node = useRef<HTMLElement | null>(null);
  const setNodeRef = useCallback(
    (element: HTMLElement | null) => {
      if (!element) {
        return;
      }

      if (element !== node.current) {
        if (onChange) {
          onChange(element);
        }

        node.current = element;
      }
    },
    [onChange]
  );

  return [node, setNodeRef] as const;
}
