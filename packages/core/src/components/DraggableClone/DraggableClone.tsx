import React, {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {CSS, Transform} from '@dnd-kit/utilities';

import {Context, DraggableNodes} from '../../store';
import {getEventCoordinates, getElementCoordinates} from '../../utilities';
import {
  applyModifiers,
  Modifiers,
  restrictToWindowEdges,
} from '../../modifiers';
import {ActiveDraggableContext} from '../DndContext';
import {UniqueIdentifier} from '../../types';

type TransitionGetter = (
  activatorEvent: Event | null
) => React.CSSProperties['transition'] | undefined;

export interface Props {
  children?: React.ReactNode;
  className?: string;
  dropAnimation?: boolean;
  wrapperElement?: keyof JSX.IntrinsicElements;
  transition?: string | TransitionGetter;
  translateModifiers?: Modifiers;
  adjustScale?: boolean;
  style?: React.CSSProperties;
}

const defaultTransition: TransitionGetter = (activatorEvent) => {
  const isKeyboardActivator = activatorEvent instanceof KeyboardEvent;

  return isKeyboardActivator ? 'transform 250ms ease' : undefined;
};

export const DraggableClone = React.memo(
  ({
    adjustScale,
    children,
    // dropAnimation = true,
    transition = defaultTransition,
    translateModifiers,
    wrapperElement,
    className,
  }: Props) => {
    const {
      active,
      draggableNodes,
      activatorEvent,
      cloneNode,
      scrollingContainerRect,
    } = useContext(Context);

    const activeRect = useMemo(() => {
      if (!active) {
        return null;
      }

      const node = draggableNodes[active]?.current;
      return node ? getElementCoordinates(node) : null;
    }, [active, draggableNodes]);
    const transform = useContext(ActiveDraggableContext);
    const modifiedTransform = applyModifiers(
      [
        restrictToWindowEdges,
        ...(translateModifiers ? translateModifiers : []),
      ],
      {
        transform,
        activeRect: cloneNode.clientRect,
        scrollingContainerRect,
      }
    );

    // TO-DO: Also probably need to account for clone container scroll delta
    // but only if the parent of the clone is not the document.body I think

    const isDragging = active !== null;
    const style: React.CSSProperties | undefined = activeRect
      ? {
          position: 'fixed',
          width: activeRect.width,
          height: activeRect.height,
          top: activeRect.top,
          left: activeRect.left,

          // TO-DO: Should this really be the default?
          zIndex: 9999,
          transform: CSS.Transform.toString(
            adjustScale
              ? modifiedTransform
              : {
                  ...modifiedTransform,
                  scaleX: 1,
                  scaleY: 1,
                }
          ),
          transformOrigin:
            adjustScale && activatorEvent && activeRect
              ? getRelativeTransformOrigin(
                  activatorEvent as MouseEvent | KeyboardEvent | TouchEvent,
                  activeRect
                )
              : undefined,
          transition:
            typeof transition === 'function'
              ? transition(activatorEvent)
              : transition,
        }
      : undefined;

    return (
      <Clone
        ref={cloneNode.setRef}
        node={cloneNode.nodeRef.current}
        active={active}
        draggableNodes={draggableNodes}
        attributes={
          isDragging
            ? {
                style,
                children,
                className,
                transform: modifiedTransform,
              }
            : undefined
        }
        wrapperElement={wrapperElement}
      />
    );
  }
);

interface CloneProps {
  active: UniqueIdentifier | null;
  attributes?: {
    className: string | undefined;
    children: React.ReactNode | null;
    style: React.CSSProperties | undefined;
    transform: Transform;
  };
  // children: React.ReactNode | null;
  draggableNodes: DraggableNodes;
  node: HTMLElement | null;
  wrapperElement: Props['wrapperElement'];
}

const Clone = forwardRef(
  (
    {
      active,
      attributes,
      draggableNodes,
      node,
      wrapperElement = 'div',
    }: CloneProps,
    ref
  ) => {
    const [dropAnimationComplete, setDropAnimationComplete] = useState(false);
    const attributesSnapshot = useRef(attributes);
    const prevActive = useRef(active);
    const derivedAttributes = attributes ?? attributesSnapshot.current;
    const {children, ...otherAttributes} = derivedAttributes ?? {};
    const shouldRender = children && !dropAnimationComplete;

    useEffect(() => {
      if (prevActive.current && !active && node) {
        const activeId = prevActive.current;
        const transformSnapshot = attributesSnapshot.current?.transform;
        const shouldPerformDropAnimation = transformSnapshot
          ? Math.abs(transformSnapshot.x) || Math.abs(transformSnapshot.y)
          : false;

        if (shouldPerformDropAnimation && transformSnapshot) {
          requestAnimationFrame(() => {
            const activeNode = draggableNodes[activeId]?.current;

            if (activeNode) {
              const fromNode =
                node.children.length > 1 ? node : node.children[0];
              const from = fromNode.getBoundingClientRect();
              const to = activeNode.getBoundingClientRect();
              const delta = {
                x: from.x - to.x,
                y: from.y - to.y,
              };

              if (Math.abs(delta.x) || Math.abs(delta.y)) {
                const scaleDelta = {
                  scaleX: (to.width * transformSnapshot.scaleX) / from.width,
                  scaleY: (to.height * transformSnapshot.scaleY) / from.height,
                };
                const finalTransform = CSS.Transform.toString({
                  x: transformSnapshot.x - delta.x,
                  y: transformSnapshot.y - delta.y,
                  ...scaleDelta,
                });

                node
                  .animate(
                    [
                      {
                        transform: CSS.Transform.toString(transformSnapshot),
                      },
                      {
                        transformOrigin: '0 0',
                        transform: finalTransform,
                      },
                    ],
                    {
                      iterations: 1,
                      easing: 'ease',
                      duration: 250,
                    }
                  )
                  .finished.then(cleanup);
                return;
              }
            }

            cleanup();
          });
        } else {
          cleanup();
        }
      }

      if (prevActive.current !== active) {
        prevActive.current = active;
      }

      if (active && attributesSnapshot.current !== attributes) {
        attributesSnapshot.current = attributes;
      }

      function cleanup() {
        setDropAnimationComplete(true);
        attributesSnapshot.current = undefined;
      }
    }, [draggableNodes, attributes, children, node, active]);

    useEffect(() => {
      if (dropAnimationComplete) {
        setDropAnimationComplete(false);
      }
    }, [dropAnimationComplete]);

    if (!shouldRender) {
      return null;
    }

    return React.createElement(
      wrapperElement,
      {
        ...otherAttributes,
        ref,
      },
      children
    );
  }
);

function getRelativeTransformOrigin(
  event: MouseEvent | TouchEvent | KeyboardEvent,
  clientRect: ClientRect
) {
  if (event instanceof KeyboardEvent) {
    return '0 0';
  }

  const eventCoordinates = getEventCoordinates(event);
  const transformOrigin = {
    x: ((eventCoordinates.x - clientRect.left) / clientRect.width) * 100,
    y: ((eventCoordinates.y - clientRect.top) / clientRect.height) * 100,
  };

  return `${transformOrigin.x}% ${transformOrigin.y}%`;
}
