import {useEffect, useState} from 'react';
import {CSS, Transform, useIsomorphicLayoutEffect} from '@dnd-kit/utilities';

import {UniqueIdentifier} from '../../../types';
import {DraggableNodes} from '../../../store';
import {getViewRect} from '../../../utilities';

export interface DropAnimation {
  duration: number;
  easing: string;
}

interface Arguments {
  activeId: UniqueIdentifier | null;
  animate: boolean;
  adjustScale: boolean;
  draggableNodes: DraggableNodes;
  duration: DropAnimation['duration'] | undefined;
  easing: DropAnimation['easing'] | undefined;
  node: HTMLElement | null;
  transform: Transform | undefined;
}

export function useDropAnimation({
  animate,
  adjustScale,
  activeId,
  draggableNodes,
  duration,
  easing,
  node,
  transform,
}: Arguments) {
  const [dropAnimationComplete, setDropAnimationComplete] = useState(false);

  useEffect(() => {
    const shouldPerformDropAnimation = transform
      ? Boolean(Math.abs(transform.x) || Math.abs(transform.y))
      : false;

    if (
      !animate ||
      !activeId ||
      !easing ||
      !duration ||
      !shouldPerformDropAnimation
    ) {
      if (animate) {
        setDropAnimationComplete(true);
      }

      return;
    }

    requestAnimationFrame(() => {
      const finalNode = draggableNodes[activeId]?.current;

      if (transform && node && finalNode && finalNode.parentNode !== null) {
        const fromNode = node.children.length > 1 ? node : node.children[0];

        if (fromNode) {
          const from = fromNode.getBoundingClientRect();
          const to = getViewRect(finalNode);
          const delta = {
            x: from.left - to.left,
            y: from.top - to.top,
          };

          if (Math.abs(delta.x) || Math.abs(delta.y)) {
            const scaleDelta = {
              scaleX: adjustScale
                ? (to.width * transform.scaleX) / from.width
                : 1,
              scaleY: adjustScale
                ? (to.height * transform.scaleY) / from.height
                : 1,
            };
            const finalTransform = CSS.Transform.toString({
              x: transform.x - delta.x,
              y: transform.y - delta.y,
              ...scaleDelta,
            });
            const originalOpacity = finalNode.style.opacity;

            finalNode.style.opacity = '0';
            node
              .animate(
                [
                  {
                    transform: CSS.Transform.toString(transform),
                  },
                  {
                    transform: finalTransform,
                  },
                ],
                {
                  easing,
                  duration,
                }
              )
              .finished.then(() => {
                setDropAnimationComplete(true);

                if (finalNode) {
                  finalNode.style.opacity = originalOpacity;
                }
              });
            return;
          }
        }
      }

      setDropAnimationComplete(true);
    });
  }, [
    animate,
    activeId,
    adjustScale,
    draggableNodes,
    duration,
    easing,
    node,
    transform,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (dropAnimationComplete) {
      setDropAnimationComplete(false);
    }
  }, [dropAnimationComplete]);

  return dropAnimationComplete;
}
