import {useEffect, useRef, useState} from 'react';
import {getBoundingClientRect, LayoutRect} from '@dnd-kit/core';
import type {Transform} from '@dnd-kit/utilities';

interface Arguments {
  rect: React.MutableRefObject<LayoutRect | null>;
  disabled: boolean;
  index: number;
  node: React.MutableRefObject<HTMLElement | null>;
}

/*
 * When the index of an item changes while sorting,
 * we need to temporarily disable the transforms
 */
export function useDerivedTransform({rect, disabled, index, node}: Arguments) {
  const [derivedTransform, setDerivedtransform] = useState<Transform | null>(
    null
  );
  const prevIndex = useRef(index);

  useEffect(() => {
    if (!disabled && index !== prevIndex.current && node.current) {
      const initial = rect.current;

      if (initial) {
        const current = getBoundingClientRect(node.current);
        const delta = {
          x: initial.offsetLeft - current.offsetLeft,
          y: initial.offsetTop - current.offsetTop,
          scaleX: initial.width / current.width,
          scaleY: initial.height / current.height,
        };

        if (delta.x || delta.y) {
          setDerivedtransform(delta);
        }
      }
    }

    if (index !== prevIndex.current) {
      prevIndex.current = index;
    }
  }, [disabled, index, node, rect]);

  useEffect(() => {
    if (derivedTransform) {
      requestAnimationFrame(() => {
        setDerivedtransform(null);
      });
    }
  }, [derivedTransform]);

  return derivedTransform;
}
