import {useTransition, useState, useRef} from 'react';
import type {Renderer} from '@dnd-kit/abstract';
import {useConstant, useOnValueChange} from '@dnd-kit/react/hooks';

export function useRenderer() {
  const [_, startTransition] = useTransition();
  const [transitionCount, setTransitionCount] = useState(0);
  const rendering = useRef<Promise<void>>();
  const resolver = useRef<() => void>();
  const renderer = useConstant<Renderer>(() => ({
    get rendering() {
      return rendering.current ?? Promise.resolve();
    },
  }));

  useOnValueChange(transitionCount, () => {
    resolver.current?.();
    rendering.current = undefined;
  });

  return {
    renderer,
    trackRendering(callback: () => void) {
      if (!rendering.current) {
        rendering.current = new Promise<void>((resolve) => {
          resolver.current = resolve;
        });
      }

      startTransition(() => {
        callback();
        setTransitionCount((count) => count + 1);
      });
    },
  };
}
