---
'@dnd-kit/core': major
---

The `<DragOverlay>` component's drop animation has been refactored, which fixes a number of bugs with the existing implementation and introduces new functionality.

### What's new?

#### Scrolling the draggable node into view if needed

The drop animation now ensures that the the draggable node that we are animating to is in the viewport before performing the drop animation and scrolls it into view if needed.

#### Changes to the `dropAnimation` prop

The `dropAnimation` prop of `<DragOverlay>` now accepts either a configuration object or a custom drop animation function.

The configuration object adheres to the following shape:

```ts
interface DropAnimationOptions {
  duration?: number;
  easing?: string;
  keyframes?: DropAnimationKeyframeResolver;
  sideEffects?: DropAnimationSideEffects;
}
```

The default drop animation options are:

```ts
const defaultDropAnimationConfiguration: DropAnimationOptions = {
  duration: 250,
  easing: 'ease',
  keyframes: defaultDropAnimationKeyframes,
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0',
      },
    },
  }),
};
```

The `keyframes` option allows consumers to override the keyframes of the drop animation. For example, here is how you would add a fade out transition to the drop animation using keyframes:

```ts
import {CSS} from '@dnd-kit/utilities';

const customDropAnimation = {
  keyframes({transform}) {
    return [
      {opacity: 1, transform: CSS.Transform.toString(transform.initial)},
      {opacity: 0, transform: CSS.Transform.toString(transform.final)},
    ];
  },
};
```

The `dragSourceOpacity` option has been deprecated in favour of letting consumers define arbitrary side effects that should run before the animation starts. Side effects may return a cleanup function that should run when the drop animation has completed.

```ts
type CleanupFunction = () => void;

export type DropAnimationSideEffects = (
  parameters: DropAnimationSideEffectsParameters
) => CleanupFunction | void;
```

Drop animation side effects are a powerful abstraction that provide a lot of flexibility. The `defaultDropAnimationSideEffects` function is exported by `@dnd-kit/core` and aims to facilitate the types of side-effects we anticipate most consumers will want to use out of the box:

```ts
interface DefaultDropAnimationSideEffectsOptions {
  // Apply a className on the active draggable or drag overlay node during the drop animation
  className?: {
    active?: string;
    dragOverlay?: string;
  };
  // Apply temporary styles to the active draggable node or drag overlay during the drop animation
  styles?: {
    active?: Styles;
    dragOverlay?: Styles;
  };
}
```

For advanced side-effects, consumers may define a custom `sideEffects` function that may optionally return a cleanup function that will be executed when the drop animation completes:

```ts
const customDropAnimation = {
  sideEffects({active}) {
    active.node.classList.add('dropAnimationInProgress');
    active.node.animate([{opacity: 0}, {opacity: 1}], {
      easing: 'ease-in',
      duration: 250,
    });

    return () => {
      // Clean up when the drop animation is complete
      active.node.classList.remove('dropAnimationInProgress');
    };
  },
};
```

For even more advanced use-cases, consumers may also provide a function to the `dropAnimation` prop, which adheres to the following shape:

```ts
interface DropAnimationFunctionArguments {
  active: {
    id: string;
    data: DataRef;
    node: HTMLElement;
    rect: ClientRect;
  };
  draggableNodes: DraggableNodes;
  dragOverlay: {
    node: HTMLElement;
    rect: ClientRect;
  };
  droppableContainers: DroppableContainers;
  measuringConfiguration: DeepRequired<MeasuringConfiguration>;
  transform: Transform;
}

type DropAnimationFunction = (
  args: DropAnimationFunctionArguments
) => Promise<void> | void;
```

### Bug fixes

- The `<DragOverlay>` now respects the `measuringConfiguration` specified for the `dragOverlay` and `draggable` properties when measuring the rects to animate to and from.
- The `<DragOverlay>` component now supports rendering children while performing the drop animation. Previously, the drag overlay would be in a broken state when trying to pick up an item while a drop animation was in progress.

### Migration steps

For consumers that were relying on the `dragSourceOpacity` property in their `dropAnimation` configuration:

```diff
+ import {defaultDropAnimationSideEffects} from '@dnd-kit/core';

const dropAnimation = {
- dragSourceOpacity: 0.5,
+ sideEffects: defaultDropAnimationSideEffects({
+   styles : {
+     active: {
+       opacity: '0.5',
+     },
+   },
+  ),
};
```
