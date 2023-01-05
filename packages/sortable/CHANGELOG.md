# @dnd-kit/sortable

## 7.0.2

### Patch Changes

- [#788](https://github.com/clauderic/dnd-kit/pull/788) [`da94c02`](https://github.com/clauderic/dnd-kit/commit/da94c02a26986b8816b7b31e318f68e9e1b9a1d2) Thanks [@clauderic](https://github.com/clauderic)! - Bug fixes for React 18 Strict Mode

- Updated dependencies [[`da94c02`](https://github.com/clauderic/dnd-kit/commit/da94c02a26986b8816b7b31e318f68e9e1b9a1d2)]:
  - @dnd-kit/core@6.0.7

## 7.0.1

### Patch Changes

- [#792](https://github.com/clauderic/dnd-kit/pull/792) [`b6970e7`](https://github.com/clauderic/dnd-kit/commit/b6970e78da868ea5c9f49368e88401d5b4cae765) Thanks [@clauderic](https://github.com/clauderic)! - The `hasSortableData` type-guard that is exported by @dnd-kit/sortable has been updated to also accept the `Active` and `Over` interfaces so it can be used in events such as `onDragStart`, `onDragOver`, and `onDragEnd`.

- Updated dependencies [[`eaa6e12`](https://github.com/clauderic/dnd-kit/commit/eaa6e126b8e4141b87d92d23478c47f5ba204f25)]:
  - @dnd-kit/core@6.0.4

## 7.0.0

### Major Changes

- [#755](https://github.com/clauderic/dnd-kit/pull/755) [`33e6dd2`](https://github.com/clauderic/dnd-kit/commit/33e6dd2dc954f1f2da90d8f8af995021031b6b41) Thanks [@clauderic](https://github.com/clauderic)! - The `UniqueIdentifier` type has been updated to now accept either `string` or `number` identifiers. As a result, the `id` property of `useDraggable`, `useDroppable` and `useSortable` and the `items` prop of `<SortableContext>` now all accept either `string` or `number` identifiers.

  #### Migration steps

  For consumers that are using TypeScript, import the `UniqueIdentifier` type to have strongly typed local state:

  ```diff
  + import type {UniqueIdentifier} from '@dnd-kit/core';

  function MyComponent() {
  -  const [items, setItems] = useState(['A', 'B', 'C']);
  +  const [items, setItems] = useState<UniqueIdentifier>(['A', 'B', 'C']);
  }
  ```

  Alternatively, consumers can cast or convert the `id` property to a `string` when reading the `id` property of interfaces such as `Active`, `Over`, `DroppableContainer` and `DraggableNode`.

  The `draggableNodes` object has also been converted to a map. Consumers that were reading from the `draggableNodes` property that is available on the public context of `<DndContext>` should follow these migration steps:

  ```diff
  - draggableNodes[someId];
  + draggableNodes.get(someId);
  ```

- [#660](https://github.com/clauderic/dnd-kit/pull/660) [`30bbd12`](https://github.com/clauderic/dnd-kit/commit/30bbd12f9606c2e99523cb9ece465041cb37e916) Thanks [@clauderic](https://github.com/clauderic)! - Changes to the default `sortableKeyboardCoordinates` KeyboardSensor coordinate getter.

  #### Better handling of variable sizes

  The default `sortableKeyboardCoordinates` function now has better handling of lists that have items of variable sizes. We recommend that consumers re-order lists `onDragOver` instead of `onDragEnd` when sorting lists of variable sizes via the keyboard for optimal compatibility.

  #### Better handling of overlapping droppables

  The default `sortableKeyboardCoordinates` function that is exported from the `@dnd-kit/sortable` package has been updated to better handle cases where the collision rectangle is overlapping droppable rectangles. For example, for `down` arrow key, the default function had logic that would only consider collisions against droppables that were below the `bottom` edge of the collision rect. This was problematic when the collision rect was overlapping droppable rects, because it meant that it's bottom edge was below the top edge of the droppable, and that resulted in that droppable being skipped.

  ```diff
  - collisionRect.bottom > droppableRect.top
  + collisionRect.top > droppableRect.top
  ```

  This change should be backwards compatible for most consumers, but may introduce regressions in some use-cases, especially for consumers that may have copied the multiple containers examples. There is now a custom sortable keyboard coordinate getter [optimized for multiple containers that you can refer to](https://github.com/clauderic/dnd-kit/tree/master/stories/2%20-%20Presets/Sortable/multipleContainersKeyboardCoordinates.ts).

### Minor Changes

- [#748](https://github.com/clauderic/dnd-kit/pull/748) [`59ca82b`](https://github.com/clauderic/dnd-kit/commit/59ca82b9f228f34c7731ece87aef5d9633608b57) Thanks [@clauderic](https://github.com/clauderic)! - Automatic focus management and activator node refs.

  #### Introducing activator node refs

  Introducing the concept of activator node refs for `useDraggable` and `useSortable`. This allows @dnd-kit to handle common use-cases such as restoring focus on the activator node after dragging via the keyboard or only allowing the activator node to instantiate the keyboard sensor.

  Consumers of `useDraggable` and `useSortable` may now optionally set the activator node ref on the element that receives listeners:

  ```diff
  import {useDraggable} from '@dnd-kit/core';

  function Draggable(props) {
    const {
      listeners,
      setNodeRef,
  +   setActivatorNodeRef,
    } = useDraggable({id: props.id});

    return (
      <div ref={setNodeRef}>
        Draggable element
        <button
          {...listeners}
  +       ref={setActivatorNodeRef}
        >
          :: Drag Handle
        </button>
      </div>
    )
  }
  ```

  It's common for the activator element (the element that receives the sensor listeners) to differ from the draggable node. When this happens, @dnd-kit has no reliable way to get a reference to the activator node after dragging ends, as the original `event.target` that instantiated the sensor may no longer be mounted in the DOM or associated with the draggable node that was previously active.

  #### Automatically restoring focus

  Focus management is now automatically handled by @dnd-kit. When the activator event is a Keyboard event, @dnd-kit will now attempt to automatically restore focus back to the first focusable node of the activator node or draggable node.

  If no activator node is specified via the `setActivatorNodeRef` setter function of `useDraggble` and `useSortable`, @dnd-kit will automatically restore focus on the first focusable node of the draggable node set via the `setNodeRef` setter function of `useDraggable` and `useSortable`.

  If you were previously managing focus manually and would like to opt-out of automatic focus management, use the newly introduced `restoreFocus` property of the `accessibility` prop of `<DndContext>`:

  ```diff
  <DndContext
    accessibility={{
  +   restoreFocus: false
    }}
  ```

- [#672](https://github.com/clauderic/dnd-kit/pull/672) [`10f6836`](https://github.com/clauderic/dnd-kit/commit/10f683631103b1d919f2fbca1177141b9369d2cf) Thanks [@clauderic](https://github.com/clauderic)! - `SortableContext` now always requests measuring of droppable containers when its `items` prop changes, regardless of whether or not dragging is in progress. Measuring will occur if the measuring configuration allows for it.

- [#754](https://github.com/clauderic/dnd-kit/pull/754) [`224201a`](https://github.com/clauderic/dnd-kit/commit/224201a2a5611f0efeb57c9b273eddf23c28e01f) Thanks [@clauderic](https://github.com/clauderic)! - The `<SortableContext>` component now optionally accepts a `disabled` prop to globally disable `useSortable` hooks rendered within it.

  The `disabled` prop accepts either a boolean or an object with the following shape:

  ```ts
  interface Disabled {
    draggable?: boolean;
    droppable?: boolean;
  }
  ```

  The `useSortable` hook has now been updated to also optionally accept the `disabled` configuration object to conditionally disable the `useDraggable` and/or `useDroppable` hooks used internally.

  Like the `strategy` prop, the `disabled` prop defined on the `useSortable` hook takes precedence over the `disabled` prop defined on the parent `<SortableContext>`.

### Patch Changes

- [#757](https://github.com/clauderic/dnd-kit/pull/757) [`e6d544f`](https://github.com/clauderic/dnd-kit/commit/e6d544f3f775e6a43de25d1aee67efeec0d5db58) Thanks [@clauderic](https://github.com/clauderic)! - The `wasDragging` property of `animateLayoutChanges` now remains true for longer than a single re-render. Before this change, it was possible for the component where `useSortable` is used to re-render before @dnd-kit is ready to perform the layout animation, causing the animation to be skipped entirely.

- [#749](https://github.com/clauderic/dnd-kit/pull/749) [`188a450`](https://github.com/clauderic/dnd-kit/commit/188a4507b99d8e8fdaa50bd26deb826c86608e18) Thanks [@clauderic](https://github.com/clauderic)! - Faster (and safer) equal implementation.

- Updated dependencies [[`4173087`](https://github.com/clauderic/dnd-kit/commit/417308704454c50f88ab305ab450a99bde5034b0), [`59ca82b`](https://github.com/clauderic/dnd-kit/commit/59ca82b9f228f34c7731ece87aef5d9633608b57), [`7161f70`](https://github.com/clauderic/dnd-kit/commit/7161f702c9fe06f8dafa6449d48b918070ca46fb), [`a52fba1`](https://github.com/clauderic/dnd-kit/commit/a52fba1ccff8a8f40e2cb8dcc15236cfd9e8fbec), [`40707ce`](https://github.com/clauderic/dnd-kit/commit/40707ce6f388957203d6df4ccbeef460450ffd7d), [`a41e5b8`](https://github.com/clauderic/dnd-kit/commit/a41e5b8eff84f0528ffc8b3455b94b95ab60a4a9), [`bf30718`](https://github.com/clauderic/dnd-kit/commit/bf30718bc22584a47053c14f5920e317ac45cd50), [`a41e5b8`](https://github.com/clauderic/dnd-kit/commit/a41e5b8eff84f0528ffc8b3455b94b95ab60a4a9), [`a41e5b8`](https://github.com/clauderic/dnd-kit/commit/a41e5b8eff84f0528ffc8b3455b94b95ab60a4a9), [`035021a`](https://github.com/clauderic/dnd-kit/commit/035021aac51161e2bf9715f087a6dd1b46647bfc), [`77e3d44`](https://github.com/clauderic/dnd-kit/commit/77e3d44502383d2f9a9f9af014b053619b3e37b3), [`5811986`](https://github.com/clauderic/dnd-kit/commit/5811986e7544a5e80039870a015e38df805eaad1), [`e302bd4`](https://github.com/clauderic/dnd-kit/commit/e302bd4488bdfb6735c97ac42c1f4a0b1e8bfdf9), [`188a450`](https://github.com/clauderic/dnd-kit/commit/188a4507b99d8e8fdaa50bd26deb826c86608e18), [`59ca82b`](https://github.com/clauderic/dnd-kit/commit/59ca82b9f228f34c7731ece87aef5d9633608b57), [`750d726`](https://github.com/clauderic/dnd-kit/commit/750d72655922363b2218d7b41e028f9dceaef013), [`5f3c700`](https://github.com/clauderic/dnd-kit/commit/5f3c7009698d15936fd20f30f11ad3b23cd7886f), [`035021a`](https://github.com/clauderic/dnd-kit/commit/035021aac51161e2bf9715f087a6dd1b46647bfc), [`e6e242c`](https://github.com/clauderic/dnd-kit/commit/e6e242cbc718ed687a26f5c622eeed4dbd6c2425), [`035021a`](https://github.com/clauderic/dnd-kit/commit/035021aac51161e2bf9715f087a6dd1b46647bfc), [`33e6dd2`](https://github.com/clauderic/dnd-kit/commit/33e6dd2dc954f1f2da90d8f8af995021031b6b41), [`10f6836`](https://github.com/clauderic/dnd-kit/commit/10f683631103b1d919f2fbca1177141b9369d2cf), [`c1b3b5a`](https://github.com/clauderic/dnd-kit/commit/c1b3b5a0be5759b707e22c4e1b1236aaa82773a2), [`035021a`](https://github.com/clauderic/dnd-kit/commit/035021aac51161e2bf9715f087a6dd1b46647bfc)]:
  - @dnd-kit/core@6.0.0
  - @dnd-kit/utilities@3.2.0

## 6.0.1

### Patch Changes

- [#642](https://github.com/clauderic/dnd-kit/pull/642) [`15a6017`](https://github.com/clauderic/dnd-kit/commit/15a6017c4c2dd66911751877cc448456d0e5c96f) Thanks [@vosatom](https://github.com/vosatom)! - Fixed an issue that affected `SortableContext` performance. The `sortedRects` property of the `SortableContext` provider were being recomputed whenever coordinates changed rather than only when the order of the items changed.

- Updated dependencies [[`b3b185d`](https://github.com/clauderic/dnd-kit/commit/b3b185dc675b61fe2e3d1a8462728c81c3150b99)]:
  - @dnd-kit/core@5.0.2

## 6.0.0

### Major Changes

- [#518](https://github.com/clauderic/dnd-kit/pull/518) [`6310227`](https://github.com/clauderic/dnd-kit/commit/63102272d0d63dae349e2e9f638277e16a7d5970) Thanks [@clauderic](https://github.com/clauderic)! - Major internal refactor of measuring and collision detection.

  ### Summary of changes

  Previously, all collision detection algorithms were relative to the top and left points of the document. While this approach worked in most situations, it broke down in a number of different use-cases, such as fixed position droppable containers and trying to drag between containers that had different scroll positions.

  This new approach changes the frame of comparison to be relative to the viewport. This is a major breaking change, and will need to be released under a new major version bump.

  ### Breaking changes:

  - By default, `@dnd-kit` now ignores only the transforms applied to the draggable / droppable node itself, but considers all the transforms applied to its ancestors. This should provide the right balance of flexibility for most consumers.
    - Transforms applied to the droppable and draggable nodes are ignored by default, because the recommended approach for moving items on the screen is to use the transform property, which can interfere with the calculation of collisions.
    - Consumers can choose an alternate approach that does consider transforms for specific use-cases if needed by configuring the measuring prop of <DndContext>. Refer to the <Switch> example.
  - Reduced the number of concepts related to measuring from `ViewRect`, `LayoutRect` to just a single concept of `ClientRect`.
    - The `ClientRect` interface no longer holds the `offsetTop` and `offsetLeft` properties. For most use-cases, you can replace `offsetTop` with `top` and `offsetLeft` with `left`.
    - Replaced the following exports from the `@dnd-kit/core` package with `getClientRect`:
      - `getBoundingClientRect`
      - `getViewRect`
      - `getLayoutRect`
      - `getViewportLayoutRect`
  - Removed `translatedRect` from the `SensorContext` interface. Replace usage with `collisionRect`.
  - Removed `activeNodeClientRect` on the `DndContext` interface. Replace with `activeNodeRect`.

- [#569](https://github.com/clauderic/dnd-kit/pull/569) [`e7ac3d4`](https://github.com/clauderic/dnd-kit/commit/e7ac3d45699dcc7b47191a67044a516929ac439c) Thanks [@clauderic](https://github.com/clauderic)! - Separated context into public and internal context providers. Certain properties that used to be available on the public `DndContextDescriptor` interface have been moved to the internal context provider and are no longer exposed to consumers:

  ```ts
  interface DndContextDescriptor {
  -  dispatch: React.Dispatch<Actions>;
  -  activators: SyntheticListeners;
  -  ariaDescribedById: {
  -    draggable: UniqueIdentifier;
  -  };
  }
  ```

  Having two distinct context providers will allow to keep certain internals such as `dispatch` hidden from consumers.

  It also serves as an optimization until context selectors are implemented in React, properties that change often, such as the droppable containers and droppable rects, the transform value and array of collisions should be stored on a different context provider to limit un-necessary re-renders in `useDraggable`, `useDroppable` and `useSortable`.

  The `<InternalContext.Provider>` is also reset to its default values within `<DragOverlay>`. This paves the way towards being able to seamlessly use components that use hooks such as `useDraggable` and `useDroppable` as children of `<DragOverlay>` without causing interference or namespace collisions.

  Consumers can still make calls to `useDndContext()` to get the `active` or `over` properties if they wish to re-render the component rendered within `DragOverlay` in response to user interaction, since those use the `PublicContext`

### Minor Changes

- [#558](https://github.com/clauderic/dnd-kit/pull/558) [`f3ad20d`](https://github.com/clauderic/dnd-kit/commit/f3ad20d5b2c2f2ca7b82c193c9af5eef38c5ce11) Thanks [@clauderic](https://github.com/clauderic)! - Refactor of the `CollisionDetection` interface to return an array of `Collision`s:

  ```diff
  +export interface Collision {
  +  id: UniqueIdentifier;
  +  data?: Record<string, any>;
  +}

  export type CollisionDetection = (args: {
    active: Active;
    collisionRect: ClientRect;
    droppableContainers: DroppableContainer[];
    pointerCoordinates: Coordinates | null;
  -}) => UniqueIdentifier;
  +}) => Collision[];
  ```

  This is a breaking change that requires all collision detection strategies to be updated to return an array of `Collision` rather than a single `UniqueIdentifier`

  The `over` property remains a single `UniqueIdentifier`, and is set to the first item in returned in the collisions array.

  Consumers can also access the `collisions` property which can be used to implement use-cases such as combining droppables in user-land.

  The `onDragMove`, `onDragOver` and `onDragEnd` callbacks are also updated to receive the collisions array property.

  Built-in collision detections such as rectIntersection, closestCenter, closestCorners and pointerWithin adhere to the CollisionDescriptor interface, which extends the Collision interface:

  ```ts
  export interface CollisionDescriptor extends Collision {
    data: {
      droppableContainer: DroppableContainer;
      value: number;
      [key: string]: any;
    };
  }
  ```

  Consumers can also access the array of collisions in components wrapped by `<DndContext>` via the `useDndContext()` hook:

  ```ts
  import {useDndContext} from '@dnd-kit/core';

  function MyComponent() {
    const {collisions} = useDndContext();
  }
  ```

- [#561](https://github.com/clauderic/dnd-kit/pull/561) [`02edd26`](https://github.com/clauderic/dnd-kit/commit/02edd2691b24bb49f2e7c9f9a3f282031bf658b7) Thanks [@clauderic](https://github.com/clauderic)! - Droppable containers now observe the node they are attached to via `setNodeRef` using `ResizeObserver` while dragging.

  This behaviour can be configured using the newly introduced `resizeObserverConfig` property.

  ```ts
  interface ResizeObserverConfig {
    /** Whether the ResizeObserver should be disabled entirely */
    disabled?: boolean;
    /** Resize events may affect the layout and position of other droppable containers.
     * Specify an array of `UniqueIdentifier` of droppable containers that should also be re-measured
     * when this droppable container resizes. Specifying an empty array re-measures all droppable containers.
     */
    updateMeasurementsFor?: UniqueIdentifier[];
    /** Represents the debounce timeout between when resize events are observed and when elements are re-measured */
    timeout?: number;
  }
  ```

  By default, only the current droppable is scheduled to be re-measured when a resize event is observed. However, this may not be suitable for all use-cases. When an element resizes, it can affect the layout and position of other elements, such that it may be necessary to re-measure other droppable nodes in response to that single resize event. The `recomputeIds` property can be used to specify which droppable `id`s should be re-measured in response to resize events being observed.

  For example, the `useSortable` preset re-computes the measurements of all sortable elements after the element that resizes, so long as they are within the same `SortableContext` as the element that resizes, since it's highly likely that their layout will also shift.

  Specifying an empty array for `recomputeIds` forces all droppable containers to be re-measured.

  For consumers that were relyings on the internals of `DndContext` using `useDndContext()`, the `willRecomputeLayouts` property has been renamed to `measuringScheduled`, and the `recomputeLayouts` method has been renamed to `measureDroppableContainers`, and now optionally accepts an array of droppable `UniqueIdentifier` that should be scheduled to be re-measured.

- [#570](https://github.com/clauderic/dnd-kit/pull/570) [`1ade2f3`](https://github.com/clauderic/dnd-kit/commit/1ade2f34403ba1d5a87cbd3ce1cff62860860501) Thanks [@clauderic](https://github.com/clauderic)! - Use `transition` for the active draggable node when keyboard sorting without a `<DragOverlay />`.

### Patch Changes

- [#566](https://github.com/clauderic/dnd-kit/pull/566) [`d315df0`](https://github.com/clauderic/dnd-kit/commit/d315df07022178460a52d6021a41227878b876b8) Thanks [@clauderic](https://github.com/clauderic)! - Fixed a bug where sortable item position was not updated when quickly dragging different sortable items.

- Updated dependencies [[`f3ad20d`](https://github.com/clauderic/dnd-kit/commit/f3ad20d5b2c2f2ca7b82c193c9af5eef38c5ce11), [`02edd26`](https://github.com/clauderic/dnd-kit/commit/02edd2691b24bb49f2e7c9f9a3f282031bf658b7), [`c6c67cb`](https://github.com/clauderic/dnd-kit/commit/c6c67cb9cbc6e61027f7bb084fd2232160037d5e), [`6310227`](https://github.com/clauderic/dnd-kit/commit/63102272d0d63dae349e2e9f638277e16a7d5970), [`e7ac3d4`](https://github.com/clauderic/dnd-kit/commit/e7ac3d45699dcc7b47191a67044a516929ac439c), [`528c67e`](https://github.com/clauderic/dnd-kit/commit/528c67e4c617dfc0ce5221496aa8b222ffc82ddb), [`02edd26`](https://github.com/clauderic/dnd-kit/commit/02edd2691b24bb49f2e7c9f9a3f282031bf658b7)]:
  - @dnd-kit/core@5.0.0
  - @dnd-kit/utilities@3.1.0

## 5.1.0

### Minor Changes

- [#486](https://github.com/clauderic/dnd-kit/pull/486) [`d86529c`](https://github.com/clauderic/dnd-kit/commit/d86529cde6daa650e9c9edce7f26fb691d71d723) Thanks [@clauderic](https://github.com/clauderic)! - Improvements to better support swappable strategies:

  - Now exporting an `arraySwap` helper to be used instead of `arrayMove` `onDragEnd`.
  - Added the `getNewIndex` prop on `useSortable`. By default, `useSortable` assumes that items will be moved to their new index using `arrayMove()`, but this isn't always the case, especially when using strategies like `rectSwappingStrategy`. For those scenarios, consumers can now define custom logic that should be used to get the new index for an item on drop, for example, by computing the new order of items using `arraySwap`.

### Patch Changes

- Updated dependencies [[`d973cc6`](https://github.com/clauderic/dnd-kit/commit/d973cc6f5aaca8a01e6da4a958164eb623c4ce9d)]:
  - @dnd-kit/core@4.0.2

## 5.0.0

### Major Changes

- [#427](https://github.com/clauderic/dnd-kit/pull/427) [`f96cb5d`](https://github.com/clauderic/dnd-kit/commit/f96cb5d5e45a1000104892244201a70cbe8e6553) Thanks [@clauderic](https://github.com/clauderic)! - - Using transform-agnostic measurements for the DragOverlay node.

  - Renamed the `overlayNode` property to `dragOverlay` on the `DndContextDescriptor` interface.

- [`9cfac05`](https://github.com/clauderic/dnd-kit/commit/9cfac057689ae1a91b663ac2eb04c47dadb9b4db) Thanks [@clauderic](https://github.com/clauderic)! - Renamed the `wasSorting` property to `wasDragging` on the `SortableContext` and `AnimateLayoutChanges` interfaces.

### Minor Changes

- [#433](https://github.com/clauderic/dnd-kit/pull/433) [`c447880`](https://github.com/clauderic/dnd-kit/commit/c447880656b6bee2915d5a5f01d3ddfbd5705fa2) Thanks [@clauderic](https://github.com/clauderic)! - Fix unwanted animations when items in sortable context change

### Patch Changes

- [#372](https://github.com/clauderic/dnd-kit/pull/372) [`dbc9601`](https://github.com/clauderic/dnd-kit/commit/dbc9601c922e1d6944a63f66ee647f203abee595) Thanks [@clauderic](https://github.com/clauderic)! - Refactored `DroppableContainers` type from `Record<UniqueIdentifier, DroppableContainer` to a custom instance that extends the [`Map` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) and adds a few other methods such as `toArray()`, `getEnabled()` and `getNodeFor(id)`.

  A unique `key` property was also added to the `DraggableNode` and `DroppableContainer` interfaces. This prevents potential race conditions in the mount and cleanup effects of `useDraggable` and `useDroppable`. It's possible for the clean-up effect to run after another React component using `useDraggable` or `useDroppable` mounts, which causes the newly mounted element to accidentally be un-registered.

- [#350](https://github.com/clauderic/dnd-kit/pull/350) [`a13dbb6`](https://github.com/clauderic/dnd-kit/commit/a13dbb66586edbf2998c7b251e236604255fd227) Thanks [@wmain](https://github.com/wmain)! - Breaking change: The `CollisionDetection` interface has been refactored. It now receives an object that contains the `active` draggable node, along with the `collisionRect` and an array of `droppableContainers`.

  If you've built custom collision detection algorithms, you'll need to update them. Refer to [this PR](https://github.com/clauderic/dnd-kit/pull/350) for examples of how to refactor collision detection functions to the new `CollisionDetection` interface.

  The `sortableKeyboardCoordinates` method has also been updated since it relies on the `closestCorners` collision detection algorithm. If you were using collision detection strategies in a custom `sortableKeyboardCoordinates` method, you'll need to update those as well.

- [`86d1f27`](https://github.com/clauderic/dnd-kit/commit/86d1f27f45fb60db6a34cd258227371595e00435) Thanks [@clauderic](https://github.com/clauderic)! - Fixed a bug in the `horizontalListSortingStrategy` where it did not check if the `currentRect` was undefined.

- [`e42a711`](https://github.com/clauderic/dnd-kit/commit/e42a711a26186c08fc888f8acbf4635ed855f2a2) Thanks [@clauderic](https://github.com/clauderic)! - Fixed a bug with the default layout animation function where it could return `true` initially even if the list had not been sorted yet. Now checking the `wasDragging` property to ensure no layout animation occurs if `wasDragging` is false.

- [#341](https://github.com/clauderic/dnd-kit/pull/341) [`e02b737`](https://github.com/clauderic/dnd-kit/commit/e02b737a3ce94f57592ac2ffe67d5bc8fabe1d43) Thanks [@clauderic](https://github.com/clauderic)! - Return `undefined` instead of `null` for `transition` in `useSortable`

- Updated dependencies [[`13be602`](https://github.com/clauderic/dnd-kit/commit/13be602229c6d5723b3ae98bca7b8f45f0773366), [`aede2cc`](https://github.com/clauderic/dnd-kit/commit/aede2cc42d488435cf65f19b63ba6bb7702b3fde), [`05d6a78`](https://github.com/clauderic/dnd-kit/commit/05d6a78a17cbaacd8dffed685dfea5a6ea3d38a8), [`a32a4c5`](https://github.com/clauderic/dnd-kit/commit/a32a4c5f6228b9f03bf460b8403a38b8c3de493f), [`f96cb5d`](https://github.com/clauderic/dnd-kit/commit/f96cb5d5e45a1000104892244201a70cbe8e6553), [`dea715c`](https://github.com/clauderic/dnd-kit/commit/dea715c342b2d998a9f1562cacb5e70c77562c92), [`dbc9601`](https://github.com/clauderic/dnd-kit/commit/dbc9601c922e1d6944a63f66ee647f203abee595), [`46ec5e4`](https://github.com/clauderic/dnd-kit/commit/46ec5e4c6e3ca9fa849666f90fef426b3c465cf0), [`7006464`](https://github.com/clauderic/dnd-kit/commit/700646468683e4820269534c6352cca93bb5a987), [`0e628bc`](https://github.com/clauderic/dnd-kit/commit/0e628bce53fb1a7223cdedd203cb07b6e62e5ec1), [`c447880`](https://github.com/clauderic/dnd-kit/commit/c447880656b6bee2915d5a5f01d3ddfbd5705fa2), [`2ba6dfe`](https://github.com/clauderic/dnd-kit/commit/2ba6dfe6b080b90b13aa8d9eb07331515a0d2faa), [`8d70540`](https://github.com/clauderic/dnd-kit/commit/8d70540771d1455c326310b438a198d2516e1d04), [`13be602`](https://github.com/clauderic/dnd-kit/commit/13be602229c6d5723b3ae98bca7b8f45f0773366), [`422d083`](https://github.com/clauderic/dnd-kit/commit/422d0831173a893099ba924bf7bbc465640fc15d), [`c4b21b4`](https://github.com/clauderic/dnd-kit/commit/c4b21b4ee17cba31c10928eb227848026f54222a), [`5a41340`](https://github.com/clauderic/dnd-kit/commit/5a41340e6561c3784da2a9266e1b852ba370918c), [`a13dbb6`](https://github.com/clauderic/dnd-kit/commit/a13dbb66586edbf2998c7b251e236604255fd227), [`e2ee0dc`](https://github.com/clauderic/dnd-kit/commit/e2ee0dccb12794c419587019defddfd82ba5d297), [`1fe9b5c`](https://github.com/clauderic/dnd-kit/commit/1fe9b5c9d34237aae6ab22d54478c419d44a079a), [`1fe9b5c`](https://github.com/clauderic/dnd-kit/commit/1fe9b5c9d34237aae6ab22d54478c419d44a079a), [`1f5ca27`](https://github.com/clauderic/dnd-kit/commit/1f5ca27b17879861c2c545160c2046a747544846)]:
  - @dnd-kit/core@4.0.0
  - @dnd-kit/utilities@3.0.0

## 4.0.0

### Patch Changes

- Updated dependencies [[`d39ab11`](https://github.com/clauderic/dnd-kit/commit/d39ab1112f9be78d467b2dfe488a7ea931d93767)]:
  - @dnd-kit/core@3.1.0

## 3.1.0

### Minor Changes

- [`68960c4`](https://github.com/clauderic/dnd-kit/commit/68960c490f50962b47a57663ee0625d7704173ec) [#295](https://github.com/clauderic/dnd-kit/pull/295) Thanks [@akhmadullin](https://github.com/akhmadullin)! - `@dnd-kit/core` is now a `peerDependency` rather than a `dependency` for other `@dnd-kit` packages that depend on it, such as `@dnd-kit/sortable` and `@dnd-kit/modifiers`. This is done to avoid issues with multiple versions of `@dnd-kit/core` being installed by some package managers such as Yarn 2.

### Patch Changes

- Updated dependencies [[`ae398de`](https://github.com/clauderic/dnd-kit/commit/ae398de012aee28f5e3bec10b438153d00f65630), [`8b938ce`](https://github.com/clauderic/dnd-kit/commit/8b938ceb158c67e9fdc4616351d1a3291ac614c3)]:
  - @dnd-kit/core@3.0.4

## 3.0.1

### Patch Changes

- [`a178857`](https://github.com/clauderic/dnd-kit/commit/a1788579ee12d1c1af8244bdf6a17f3f5ba388a1) [#214](https://github.com/clauderic/dnd-kit/pull/214) Thanks [@clauderic](https://github.com/clauderic)! - Ensure that consumer defined data passed to `useSortable` is passed down to both `useDraggable` and `useDroppable`.

  The `data` object that is passed to `useDraggable` and `useDroppable` within `useSortable` also contains the `sortable` property, which holds a reference to the index of the item, along with the `containerId` and the `items` of its parent `SortableContext`.

## 3.0.0

### Major Changes

- [`a9d92cf`](https://github.com/clauderic/dnd-kit/commit/a9d92cf1fa35dd957e6c5915a13dfd2af134c103) [#174](https://github.com/clauderic/dnd-kit/pull/174) Thanks [@clauderic](https://github.com/clauderic)! - Distributed assets now only target modern browsers. [Browserlist](https://github.com/browserslist/browserslist) config:

  ```
  defaults
  last 2 version
  not IE 11
  not dead
  ```

  If you need to support older browsers, include the appropriate polyfills in your project's build process.

### Minor Changes

- [`b7355d1`](https://github.com/clauderic/dnd-kit/commit/b7355d19d9e15bb1972627bb622c2487ddec82ad) [#207](https://github.com/clauderic/dnd-kit/pull/207) Thanks [@clauderic](https://github.com/clauderic)! - The `data` argument for `useDraggable` and `useDroppable` is now exposed in event handlers and on the `active` and `over` objects.

  **Example usage:**

  ```tsx
  import {DndContext, useDraggable, useDroppable} from '@dnd-kit/core';

  function Draggable() {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
      id: 'draggable',
      data: {
        type: 'type1',
      },
    });

    /* ... */
  }

  function Droppable() {
    const {setNodeRef} = useDroppable({
      id: 'droppable',
      data: {
        accepts: ['type1', 'type2'],
      },
    });

    /* ... */
  }

  function App() {
    return (
      <DndContext
        onDragEnd={({active, over}) => {
          if (over?.data.current.accepts.includes(active.data.current.type)) {
            // do stuff
          }
        }}
      />
    );
  }
  ```

### Patch Changes

- [`fb2db94`](https://github.com/clauderic/dnd-kit/commit/fb2db941d00d1f876a62751c6ac9d79143876598) [#212](https://github.com/clauderic/dnd-kit/pull/212) Thanks [@clauderic](https://github.com/clauderic)! - Allow consumers of `SortableContext` to provide items of shape `{id: string}[]` or `string[]`

- Updated dependencies [[`b7355d1`](https://github.com/clauderic/dnd-kit/commit/b7355d19d9e15bb1972627bb622c2487ddec82ad), [`a9d92cf`](https://github.com/clauderic/dnd-kit/commit/a9d92cf1fa35dd957e6c5915a13dfd2af134c103), [`b406cb9`](https://github.com/clauderic/dnd-kit/commit/b406cb9251beef8677d05c45ec42bab7581a86dc)]:
  - @dnd-kit/core@3.0.0
  - @dnd-kit/utilities@2.0.0

## 2.0.1

### Patch Changes

- [`92afb0f`](https://github.com/clauderic/dnd-kit/commit/92afb0f6bcb9dd91f7e487ef44c43c8d28241f6f) [#168](https://github.com/clauderic/dnd-kit/pull/168) Thanks [@clauderic](https://github.com/clauderic)! - Make sure that the `wasSorting` argument of the `animateLayoutChanges` prop of `useSortable` always receives the latest value.

- Updated dependencies [[`bdb1aa2`](https://github.com/clauderic/dnd-kit/commit/bdb1aa2b62f855a4ccd048d452d4dd93529af563)]:
  - @dnd-kit/core@2.1.0

## 2.0.0

### Major Changes

- [`8583825`](https://github.com/clauderic/dnd-kit/commit/8583825380bc4d7c36e076be30bb5ca3fd20a26b) [#140](https://github.com/clauderic/dnd-kit/pull/140) Thanks [@clauderic](https://github.com/clauderic)! - Auto-scrolling defaults have been updated, which should generally lead to improved user experience for most consumers.

  The auto-scroller now bases its calculations based on the position of the pointer rather than the edges of the draggable element's rect by default. This change is aligned with how the native HTML 5 Drag & Drop auto-scrolling behaves.

  This behaviour can be customized using the `activator` option of the `autoScroll` prop:

  ```tsx
  import {AutoScrollActivator, DndContext} from '@dnd-kit/core';

  <DndContext autoScroll={{activator: AutoScrollActivator.DraggableRect}} />;
  ```

  The auto-scroller now also looks at scrollable ancestors in order of appearance in the DOM tree, meaning it will first attempt to scroll the window, and narrow its focus down rather than the old behaviour of looking at scrollable ancestors in order of closeness to the draggable element in the DOM tree (reversed tree order).

  This generally leads to an improved user experience, but can be customized by passing a configuration object to the `autoScroll` prop that sets the `order` option to `TraversalOrder.ReversedTreeOrder` instead of the new default value of `TraversalOrder.TreeOrder`:

  ```tsx
  import {DndContext, TraversalOrder} from '@dnd-kit/core';

  <DndContext autoScroll={{order: TraversalOrder.ReversedTreeOrder}} />;
  ```

  The autoscrolling `thresholds`, `acceleration` and `interval` can now also be customized using the `autoScroll` prop:

  ```tsx
  import {DndContext} from '@dnd-kit/core';

  <DndContext
    autoScroll={{
      thresholds: {
        // Left and right 10% of the scroll container activate scrolling
        x: 0.1,
        // Top and bottom 25% of the scroll container activate scrolling
        y: 0.25,
      },
      // Accelerate slower than the default value (10)
      acceleration: 5,
      // Auto-scroll every 10ms instead of the default value of 5ms
      interval: 10,
    }}
  />;
  ```

  Finally, consumers can now conditionally opt out of scrolling certain scrollable ancestors using the `canScroll` option of the `autoScroll` prop:

  ```tsx
  import {DndContext} from '@dnd-kit/core';

  <DndContext
    autoScroll={{
      canScroll(element) {
        if (element === document.scrollingElement) {
          return false;
        }

        return true;
      },
    }}
  />;
  ```

### Patch Changes

- Updated dependencies [[`8583825`](https://github.com/clauderic/dnd-kit/commit/8583825380bc4d7c36e076be30bb5ca3fd20a26b)]:
  - @dnd-kit/core@2.0.0

## 1.1.0

### Minor Changes

- [`79f6088`](https://github.com/clauderic/dnd-kit/commit/79f6088dab2d4e7443743f85b329a25a023ecd87) [#144](https://github.com/clauderic/dnd-kit/pull/144) Thanks [@clauderic](https://github.com/clauderic)! - Allow consumers to determine whether to animate layout changes and when to measure nodes. Consumers can now use the `animateLayoutChanges` prop of `useSortable` to determine whether layout animations should occur. Consumers can now also decide when to measure layouts, and at what frequency using the `layoutMeasuring` prop of `DndContext`. By default, `DndContext` will measure layouts just-in-time after sorting has begun. Consumers can override this behaviour to either only measure before dragging begins (on mount and after dragging), or always (on mount, before dragging, after dragging). Pairing the `layoutMeasuring` prop on `DndContext` and the `animateLayoutChanges` prop of `useSortable` opens up a number of new possibilities for consumers, such as animating insertion and removal of items in a sortable list.

### Patch Changes

- Updated dependencies [[`adb7bd5`](https://github.com/clauderic/dnd-kit/commit/adb7bd58d7d95db5e450a1518541d3d71704529d), [`79f6088`](https://github.com/clauderic/dnd-kit/commit/79f6088dab2d4e7443743f85b329a25a023ecd87), [`a76cd5a`](https://github.com/clauderic/dnd-kit/commit/a76cd5abcc0b17eae20d4a6256d95b47f2e9d050)]:
  - @dnd-kit/core@1.2.0

## 1.0.2

### Patch Changes

- [`423610c`](https://github.com/clauderic/dnd-kit/commit/423610ca48c5e5ca95545fdb5c5cfcfbd3d233ba) [#56](https://github.com/clauderic/dnd-kit/pull/56) Thanks [@clauderic](https://github.com/clauderic)! - Add MIT license to package.json and distributed files

- Updated dependencies [[`423610c`](https://github.com/clauderic/dnd-kit/commit/423610ca48c5e5ca95545fdb5c5cfcfbd3d233ba), [`594a24e`](https://github.com/clauderic/dnd-kit/commit/594a24e61e2fb559bceab8b50a07ceeeadf86417), [`fd25eaf`](https://github.com/clauderic/dnd-kit/commit/fd25eaf7c114f73918bf83801890d970c9b56d18)]:
  - @dnd-kit/core@1.0.2
  - @dnd-kit/utilities@1.0.2

## 1.0.1

### Patch Changes

- [`0b343c7`](https://github.com/clauderic/dnd-kit/commit/0b343c7e88a68351f8a39f643e9f26b8e046ef48) [#52](https://github.com/clauderic/dnd-kit/pull/52) Thanks [@clauderic](https://github.com/clauderic)! - Add repository entry to package.json files

- [`78a7b67`](https://github.com/clauderic/dnd-kit/commit/78a7b672e856c911e7cfdd4ec8f6e4d0e7c36531) Thanks [@clauderic](https://github.com/clauderic)! - Fix an issue with the sortable keyboard coordinate getter not excluding disabled droppables.

- Updated dependencies [[`0b343c7`](https://github.com/clauderic/dnd-kit/commit/0b343c7e88a68351f8a39f643e9f26b8e046ef48), [`5194696`](https://github.com/clauderic/dnd-kit/commit/5194696b4b91f26379cd3e6c11b2d66c92d32c5b), [`310bbd6`](https://github.com/clauderic/dnd-kit/commit/310bbd6370e85f8fb16cad149e6254600a5beb3a)]:
  - @dnd-kit/utilities@1.0.1
  - @dnd-kit/core@1.0.1

## 1.0.0

### Major Changes

- [`2912350`](https://github.com/clauderic/dnd-kit/commit/2912350c5008c2b0edda3bae30b5075a852dea63) Thanks [@clauderic](https://github.com/clauderic)! - Initial public release.

### Patch Changes

- Updated dependencies [[`2912350`](https://github.com/clauderic/dnd-kit/commit/2912350c5008c2b0edda3bae30b5075a852dea63)]:
  - @dnd-kit/core@1.0.0
  - @dnd-kit/utilities@1.0.0

## 0.1.0

### Minor Changes

- [`7bd4568`](https://github.com/clauderic/dnd-kit/commit/7bd4568e9f339552fd73a9a4c888460b11195a5e) [#30](https://github.com/clauderic/dnd-kit/pull/30) - Initial beta release, authored by [@clauderic](https://github.com/clauderic).

### Patch Changes

- Updated dependencies [[`7bd4568`](https://github.com/clauderic/dnd-kit/commit/7bd4568e9f339552fd73a9a4c888460b11195a5e)]:
  - @dnd-kit/core@0.1.0
  - @dnd-kit/utilities@0.1.0
