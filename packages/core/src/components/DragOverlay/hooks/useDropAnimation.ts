import {CSS, useEvent, getWindow} from '@dnd-kit/utilities';
import type {DeepRequired, Transform} from '@dnd-kit/utilities';

import type {
  Active,
  DraggableNode,
  DraggableNodes,
  DroppableContainers,
} from '../../../store';
import type {ClientRect, UniqueIdentifier} from '../../../types';
import {getMeasurableNode} from '../../../utilities/nodes';
import {scrollIntoViewIfNeeded} from '../../../utilities/scroll';
import {parseTransform} from '../../../utilities/transform';
import type {MeasuringConfiguration} from '../../DndContext';
import type {Animation} from '../components';

interface SharedParameters {
  active: {
    id: UniqueIdentifier;
    data: Active['data'];
    node: HTMLElement;
    rect: ClientRect;
  };
  dragOverlay: {
    node: HTMLElement;
    rect: ClientRect;
  };
  draggableNodes: DraggableNodes;
  droppableContainers: DroppableContainers;
  measuringConfiguration: DeepRequired<MeasuringConfiguration>;
}

export interface KeyframeResolverParameters extends SharedParameters {
  transform: {
    initial: Transform;
    final: Transform;
  };
}

export type KeyframeResolver = (
  parameters: KeyframeResolverParameters
) => Keyframe[];

export interface DropAnimationOptions {
  keyframes?: KeyframeResolver;
  duration?: number;
  easing?: string;
  sideEffects?: DropAnimationSideEffects | null;
}

export type DropAnimation = DropAnimationFunction | DropAnimationOptions;

interface Arguments {
  draggableNodes: DraggableNodes;
  droppableContainers: DroppableContainers;
  measuringConfiguration: DeepRequired<MeasuringConfiguration>;
  config?: DropAnimation | null;
}

export interface DropAnimationFunctionArguments extends SharedParameters {
  transform: Transform;
}

export type DropAnimationFunction = (
  args: DropAnimationFunctionArguments
) => Promise<void> | void;

type CleanupFunction = () => void;

export interface DropAnimationSideEffectsParameters extends SharedParameters {}

export type DropAnimationSideEffects = (
  parameters: DropAnimationSideEffectsParameters
) => CleanupFunction | void;

type ExtractStringProperties<T> = {
  [K in keyof T]?: T[K] extends string ? string : never;
};

type Styles = ExtractStringProperties<CSSStyleDeclaration>;

interface DefaultDropAnimationSideEffectsOptions {
  className?: {
    active?: string;
    dragOverlay?: string;
  };
  styles?: {
    active?: Styles;
    dragOverlay?: Styles;
  };
}

export const defaultDropAnimationSideEffects = (
  options: DefaultDropAnimationSideEffectsOptions
): DropAnimationSideEffects => ({active, dragOverlay}) => {
  const originalStyles: Record<string, string> = {};
  const {styles, className} = options;

  if (styles?.active) {
    for (const [key, value] of Object.entries(styles.active)) {
      if (value === undefined) {
        continue;
      }

      originalStyles[key] = active.node.style.getPropertyValue(key);
      active.node.style.setProperty(key, value);
    }
  }

  if (styles?.dragOverlay) {
    for (const [key, value] of Object.entries(styles.dragOverlay)) {
      if (value === undefined) {
        continue;
      }

      dragOverlay.node.style.setProperty(key, value);
    }
  }

  if (className?.active) {
    active.node.classList.add(className.active);
  }

  if (className?.dragOverlay) {
    dragOverlay.node.classList.add(className.dragOverlay);
  }

  return function cleanup() {
    for (const [key, value] of Object.entries(originalStyles)) {
      active.node.style.setProperty(key, value);
    }

    if (className?.active) {
      active.node.classList.remove(className.active);
    }
  };
};

const defaultKeyframeResolver: KeyframeResolver = ({
  transform: {initial, final},
}) => [
  {
    transform: CSS.Transform.toString(initial),
  },
  {
    transform: CSS.Transform.toString(final),
  },
];

export const defaultDropAnimationConfiguration: Required<DropAnimationOptions> = {
  duration: 250,
  easing: 'ease',
  keyframes: defaultKeyframeResolver,
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0',
      },
    },
  }),
};

export function useDropAnimation({
  config,
  draggableNodes,
  droppableContainers,
  measuringConfiguration,
}: Arguments) {
  return useEvent<Animation>((id, node) => {
    if (config === null) {
      return;
    }

    const activeDraggable: DraggableNode | undefined = draggableNodes.get(id);

    if (!activeDraggable) {
      return;
    }

    const activeNode = activeDraggable.node.current;

    if (!activeNode) {
      return;
    }

    const measurableNode = getMeasurableNode(node);

    if (!measurableNode) {
      return;
    }
    const {transform} = getWindow(node).getComputedStyle(node);
    const parsedTransform = parseTransform(transform);

    if (!parsedTransform) {
      return;
    }

    const animation: DropAnimationFunction =
      typeof config === 'function'
        ? config
        : createDefaultDropAnimation(config);

    scrollIntoViewIfNeeded(
      activeNode,
      measuringConfiguration.draggable.measure
    );

    return animation({
      active: {
        id,
        data: activeDraggable.data,
        node: activeNode,
        rect: measuringConfiguration.draggable.measure(activeNode),
      },
      draggableNodes,
      dragOverlay: {
        node,
        rect: measuringConfiguration.dragOverlay.measure(measurableNode),
      },
      droppableContainers,
      measuringConfiguration,
      transform: parsedTransform,
    });
  });
}

function createDefaultDropAnimation(
  options: DropAnimationOptions | undefined
): DropAnimationFunction {
  const {duration, easing, sideEffects, keyframes} = {
    ...defaultDropAnimationConfiguration,
    ...options,
  };

  return ({active, dragOverlay, transform, ...rest}) => {
    if (!duration) {
      // Do not animate if animation duration is zero.
      return;
    }

    const delta = {
      x: dragOverlay.rect.left - active.rect.left,
      y: dragOverlay.rect.top - active.rect.top,
    };

    const scale = {
      scaleX:
        transform.scaleX !== 1
          ? (active.rect.width * transform.scaleX) / dragOverlay.rect.width
          : 1,
      scaleY:
        transform.scaleY !== 1
          ? (active.rect.height * transform.scaleY) / dragOverlay.rect.height
          : 1,
    };
    const finalTransform = {
      x: transform.x - delta.x,
      y: transform.y - delta.y,
      ...scale,
    };

    const animationKeyframes = keyframes({
      ...rest,
      active,
      dragOverlay,
      transform: {initial: transform, final: finalTransform},
    });

    const [firstKeyframe] = animationKeyframes;
    const lastKeyframe = animationKeyframes[animationKeyframes.length - 1];

    if (JSON.stringify(firstKeyframe) === JSON.stringify(lastKeyframe)) {
      // The start and end keyframes are the same, infer that there is no animation needed.
      return;
    }

    const cleanup = sideEffects?.({active, dragOverlay, ...rest});
    const animation = dragOverlay.node.animate(animationKeyframes, {
      duration,
      easing,
      fill: 'forwards',
    });

    return new Promise((resolve) => {
      animation.onfinish = () => {
        cleanup?.();
        resolve();
      };
    });
  };
}
