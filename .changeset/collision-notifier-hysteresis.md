---
'@dnd-kit/abstract': patch
---

Prevent drop targets from oscillating when setting a drop target causes layout shifts.

`CollisionNotifier` now tracks droppables that were recently set or cleared as the drop target, along with the pointer coordinates at which the change happened, and ignores collisions with them until the pointer has traveled a minimum distance (`CollisionNotifier.hysteresis`, 10px by default). This breaks the feedback loop where re-ordering items across containers shifts the layout in a way that immediately favors the previous drop target, causing items to flicker back and forth between containers (for example, between two columns in a multi-column board) on every micro pointer movement.
