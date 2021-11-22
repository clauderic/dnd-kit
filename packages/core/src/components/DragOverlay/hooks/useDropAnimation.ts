import {useState} from 'react';
import {CSS, Transform, useIsomorphicLayoutEffect} from '@dnd-kit/utilities';

import type {UniqueIdentifier} from '../../../types';
import type {DraggableNodes} from '../../../store';
import {getMeasurableNode} from '../../../utilities/nodes';
import {getTransformAgnosticClientRect} from '../../../utilities/rect';

export interface DropAnimation {
  duration: number;
  easing: string;
  dragSourceOpacity?: number;
}

interface Arguments {
  activeId: UniqueIdentifier | null;
  animate: boolean;
  adjustScale: boolean;
  draggableNodes: DraggableNodes;
  duration: DropAnimation['duration'] | undefined;
  easing: DropAnimation['easing'] | undefined;
  dragSourceOpacity: DropAnimation['dragSourceOpacity'] | undefined;
  node: HTMLElement | null;
  transform: Transform | undefined;
}

export const defaultDropAnimation: DropAnimation = {
  duration: 250,
  easing: 'ease',
  dragSourceOpacity: 0,
};

export function useDropAnimation({
  animate,
  adjustScale,
  activeId,
  draggableNodes,
  duration,
  dragSourceOpacity,
  easing,
  node,
  transform,
}: Arguments) {
  const [dropAnimationComplete, setDropAnimationComplete] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (!animate || !activeId || !easing || !duration) {
      if (animate) {
        setDropAnimationComplete(true);
      }

      return;
    }

    const finalNode = draggableNodes[activeId]?.node.current;

    if (transform && node && finalNode && finalNode.parentNode !== null) {
      const fromNode = getMeasurableNode(node);

      if (fromNode) {
        const from = fromNode.getBoundingClientRect();
        const to = getTransformAgnosticClientRect(finalNode);

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

          if (dragSourceOpacity != null) {
            finalNode.style.opacity = `${dragSourceOpacity}`;
          }

          const nodeAnimation = node.animate(
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
          );

          nodeAnimation.onfinish = () => {
            node.style.display = 'none';

            setDropAnimationComplete(true);

            if (finalNode && dragSourceOpacity != null) {
              finalNode.style.opacity = originalOpacity;
            }
          };
          return;
        }
      }
    }

    setDropAnimationComplete(true);
  }, [
    animate,
    activeId,
    adjustScale,
    draggableNodes,
    duration,
    easing,
    dragSourceOpacity,
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
