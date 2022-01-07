---
'@dnd-kit/core': major
'@dnd-kit/sortable': minor
---

Refactor of the `CollisionDetection` interface to return an array of `Collision`s:

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
