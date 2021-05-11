# Collision detection algorithms

If you're familiar with how 2D games are built, you may have come across the notion of collision detection algorithms.

One of the simpler forms of collision detection is between two rectangles that are axis aligned — meaning rectangles that are not rotated. This form of collision detection is generally referred to as [Axis-Aligned Bounding Box](https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection#Axis-Aligned_Bounding_Box) \(AABB\).

The built-in collision detection algorithms assume a rectangular bounding box.

> The bounding box of an element is the smallest possible rectangle \(aligned with the axes of that element's user coordinate system\) that entirely encloses it and its descendants.
> – Source: [MDN](https://developer.mozilla.org/en-US/docs/Glossary/bounding_box)

This means that even if the draggable or droppable nodes look round or triangular, their bounding boxes will still be rectangular:

![](/axis-aligned-rectangle.png)

If you'd like to use other shapes than rectangles for detecting collisions, build your own [custom collision detection strategy](collision-detection-algorithms.md#custom-collision-detection-strategies).

## Rectangle intersection

By default, [`DndContext`](./) uses the **rectangle intersection** collision detection strategy.

The algorithm works by ensuring there is no gap between any of the 4 sides of the rectangles. Any gap means a collision does not exist.

This means that in order for a draggable item to be considered **over** a droppable area, there needs to be an intersection between both rectangles:

![](/rect-intersection-1-.png)

## Closest center

While the rectangle intersection strategy is well suited for most drag and drop use cases, it can be unforgiving, since it requires both the draggable and droppable bounding rectangles to come into direct contact and intersect.

For some use cases, such as [sortable](../../presets/sortable/) lists, using a more forgiving collision detection strategy is recommended.

As its name suggests, the closest center strategy finds the droppable container who's center is closest to the center of the bounding rectangle of the active draggable item:

![](/closest-center-2-.png)

## Closest corners

Like to the closest center algorithm, the closest corner algorithm doesn't require the draggable and droppable rectangles to intersect.

Rather, it measures the distance between all four corners of the active draggable item and the four corners of each droppable container to find the closest one.

![](/closest-corners.png)

The distance is measured from the top left corner of the draggable item to the top left corner of the droppable bounding rectangle, top right to top right, bottom left to bottom left, and bottom right to bottom right.

### **When should I use the closest corners algorithm instead of closest center?**

In most cases, the **closest center** algorithm works well, and is generally the recommended default for sortable lists because it provides a more forgiving experience than the **rectangle intersection algorithm**.

In general, the closest center and closest corners algorithms will yield the same results. However, when building interfaces where droppable containers are stacked on top of one another, for example, when building a Kanban, the closest center algorithm can sometimes return the underlaying droppable of the entire Kanban column rather than the droppable areas within that column.

![Closest center is 'A', though the human eye would likely expect 'A2'](/closest-center-kanban.png)

In those situations, the **closest corners** algorithm is preferred and will yield results that are more aligned with what the human eye would predict:

![Closest corners is 'A2', as the human eye would expect.](/closest-corners-kanban.png)

## Custom collision detection strategies

In advanced use cases, you may want to build your own collision detection algorithms if the ones provided out of the box do not suit your use case.

You can either write a new collision detection algorithm from scratch, or compose two or more existing collision detection algorithms.

### Composition of existing algorithms

One example where composition of existing algorithms can be useful is if you want some of your droppable containers to have a different collision detection strategy than the others.

For instance, if you were building a sortable list that also supported moving items to a trash bin, you may want to compose both the `closestCenter` and `rectangleIntersection` collision detection algorithms.

![Use the closest corners algorithm for all droppables except 'trash'.](/custom-collision-detection.png)

![Use the intersection detection strategy for the 'trash' droppable.](/custom-collision-detection-intersection.png)

From an implementation perspective, the custom intersection strategy described in the example above would look like:

```javascript
import {closestCorners, rectIntersection} from '@dnd-kit/core';

function customCollisionDetectionStrategy(rects, rect) {
  const trashRect = rects.filter(([id]) => id === 'trash');
  const intersectingTrashRect = rectIntersection(trashRect, rect);

  if (intersectingTrashRect) {
    return intersectingTrashRect;
  }

  const otherRects = rects.filter(([id]) => id !== 'trash');

  return closestCorners(otherRects, rect);
}
```

### Building custom collision detection algorithms

For advanced use cases or to detect collision between non-rectangular or non-axis aligned shapes, you'll want to build your own collision detection algorithms.

Here's an example to [detect collisions between circles](https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection#Circle_Collision) instead of rectangles:

```javascript
function getMaxValueIndex(
  array: number[],
  comparator: (value: number, tracked: number) => boolean
) {
  if (array.length === 0) {
    return -1;
  }

  let tracked = array[0];
  let index = 0;

  for (var i = 1; i < array.length; i++) {
    const value = array[i];

    if (value > tracked) {
      index = i;
      tracked = value;
    }
  }

  return index;
}

function getCircleIntersection(entry, target) {
  // Abstracted the logic to calculate the radius for simplicity
  var circle1 = {radius: 20, x: entry.offsetLeft, y: entry.offsetTop};
  var circle2 = {radius: 12, x: target.offsetLeft, y: target.offsetTop};

  var dx = circle1.x - circle2.x;
  var dy = circle1.y - circle2.y;
  var distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < circle1.radius + circle2.radius) {
    return distance;
  }

  return 0;
}

/**
 * Returns the circle that has the greatest intersection area
 */
function circleIntersection(entries, target) => {
  const intersections = entries.map(([_, entry]) =>
    getCircleIntersection(entry, target)
  );

  const maxValueIndex = getMaxValueIndex(intersections);

  if (intersections[maxValueIndex] <= 0) {
    return null;
  }

  return entries[maxValueIndex] ? entries[maxValueIndex][0] : null;
};
```

To learn more, refer to the implementation of the built-in collision detection algorithms.
