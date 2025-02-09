---
'@dnd-kit/geometry': patch
'@dnd-kit/collision': patch
---

- Added `corners` getter to `Rectangle` instances to retrieve the coordinates of all four corners.
- Added `delta` static method to the `Rectangle` constructor which makes it easy to calculate the delta between a given reference point of both shapes.
