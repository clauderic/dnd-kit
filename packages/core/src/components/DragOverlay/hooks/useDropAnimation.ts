import {CSS, useEvent, getWindow} from '@dnd-kit/utilities';
import type {DeepRequired, Transform} from '@dnd-kit/utilities';

import type {
  Active,
  AnyData,
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

interface SharedParameters<DraggableData, DroppableData> {
  active: {
    id: UniqueIdentifier;
    data: Active<DraggableData>['data'];
    node: HTMLElement;
    rect: ClientRect;
  };
  dragOverlay: {
    node: HTMLElement;
    rect: ClientRect;
  };
  draggableNodes: DraggableNodes<DraggableData>;
  droppableContainers: DroppableContainers<DroppableData>;
  measuringConfiguration: DeepRequired<MeasuringConfiguration>;
}

export interface KeyframeResolverParameters<DraggableData, DroppableData>
  extends SharedParameters<DraggableData, DroppableData> {
  transform: {
    initial: Transform;
    final: Transform;
  };
}

export type KeyframeResolver<DraggableData, DroppableData> = (
  parameters: KeyframeResolverParameters<DraggableData, DroppableData>
) => Keyframe[];

export interface DropAnimationOptions<DraggableData, DroppableData> {
  keyframes?: KeyframeResolver<DraggableData, DroppableData>;
  duration?: number;
  easing?: string;
  sideEffects?: DropAnimationSideEffects<DraggableData, DroppableData> | null;
}

export type DropAnimation<DraggableData = AnyData, DroppableData = AnyData> =
  | DropAnimationFunction<DraggableData, DroppableData>
  | DropAnimationOptions<DraggableData, DroppableData>;

interface Arguments<DraggableData, DroppableData> {
  draggableNodes: DraggableNodes<DraggableData>;
  droppableContainers: DroppableContainers<DroppableData>;
  measuringConfiguration: DeepRequired<MeasuringConfiguration>;
  config?: DropAnimation<DraggableData, DroppableData> | null;
}

export interface DropAnimationFunctionArguments<DraggableData, DroppableData>
  extends SharedParameters<DraggableData, DroppableData> {
  transform: Transform;
}

export type DropAnimationFunction<DraggableData, DroppableData> = (
  args: DropAnimationFunctionArguments<DraggableData, DroppableData>
) => Promise<void> | void;

type CleanupFunction = () => void;

export interface DropAnimationSideEffectsParameters<
  DraggableData,
  DroppableData
> extends SharedParameters<DraggableData, DroppableData> {}

export type DropAnimationSideEffects<DraggableData, DroppableData> = (
  parameters: DropAnimationSideEffectsParameters<DraggableData, DroppableData>
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

export const defaultDropAnimationSideEffects =
  (
    options: DefaultDropAnimationSideEffectsOptions
  ): DropAnimationSideEffects<AnyData, AnyData> =>
  ({active, dragOverlay}) => {
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

const defaultKeyframeResolver: KeyframeResolver<AnyData, AnyData> = ({
  transform: {initial, final},
}) => [
  {
    transform: CSS.Transform.toString(initial),
  },
  {
    transform: CSS.Transform.toString(final),
  },
];

export const defaultDropAnimationConfiguration: Required<
  DropAnimationOptions<AnyData, AnyData>
> = {
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

export function useDropAnimation<DraggableData, DroppableData>({
  config,
  draggableNodes,
  droppableContainers,
  measuringConfiguration,
}: Arguments<DraggableData, DroppableData>) {
  return useEvent<Animation>((id, node) => {
    if (config === null) {
      return;
    }

    const activeDraggable: DraggableNode<DraggableData> | undefined =
      draggableNodes.get(id);

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

    const animation: DropAnimationFunction<DraggableData, DroppableData> =
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

function createDefaultDropAnimation<DraggableData, DroppableData>(
  options: DropAnimationOptions<DraggableData, DroppableData> | undefined
): DropAnimationFunction<DraggableData, DroppableData> {
  const {duration, easing, sideEffects, keyframes} = {
    ...(defaultDropAnimationConfiguration as Required<
      DropAnimationOptions<DraggableData, DroppableData>
    >),
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
