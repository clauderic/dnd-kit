import {useTransition, useState, useRef, useLayoutEffect} from 'react';
import type {Renderer} from '@dnd-kit/abstract';
import {useConstant, useOnValueChange} from '@dnd-kit/react/hooks';

export function useRenderer() {
  const [_, startTransition] = useTransition();
  const [transitionCount, setTransitionCount] = useState(0);
  const rendering = useRef<Promise<void>>(null);
  const resolver = useRef<() => void>(null);
  const renderer = useConstant<Renderer>(() => ({
    get rendering() {
      return rendering.current ?? Promise.resolve();
    },
  }));

  useOnValueChange(
    transitionCount,
    () => {
      resolver.current?.();
      rendering.current = null;
    },
    useLayoutEffect
  );

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
