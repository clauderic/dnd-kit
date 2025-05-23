import {
  forwardRef,
  memo,
  startTransition,
  useImperativeHandle,
  useState,
  useRef,
  useMemo,
} from 'react';
import type {Renderer as AbstractRenderer} from '@dnd-kit/abstract';
import {useIsomorphicLayoutEffect} from '@dnd-kit/react/hooks';

export type ReactRenderer = {
  renderer: AbstractRenderer;
  trackRendering: (callback: () => void) => void;
};

export const Renderer = memo(
  forwardRef<ReactRenderer, {children: React.ReactNode}>(({children}, ref) => {
    const [transitionCount, setTransitionCount] = useState(0);
    const rendering = useRef<Promise<void>>(null);
    const resolver = useRef<() => void>(null);
    const renderer = useMemo<ReactRenderer>(
      () => ({
        renderer: {
          get rendering() {
            return rendering.current ?? Promise.resolve();
          },
        },
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
      }),
      []
    );

    useIsomorphicLayoutEffect(() => {
      resolver.current?.();
      rendering.current = null;
    }, [children, transitionCount]);

    useImperativeHandle(ref, () => renderer);

    return null;
  })
);
