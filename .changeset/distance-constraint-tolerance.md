---
"@dnd-kit/core": minor
---

Added support for `tolerance` in DistanceConstrain. As soon as the `tolerance` is exceeded, the drag operation will be aborted, unless it has already started (because distance criteria was met). 

Example usage:

```
// Require the pointer be moved by 10 pixels vertically to initiate drag operation
// Abort if the pointer is moved by more than 5 pixels horizontally.
{
  distance: {y: 10},
  tolerance: {x: 5},
}
```

Be careful not to pick conflicting settings for distance and tolerance if used together. For example, picking a tolerance that is lower than the distance in the same axis would result in the activation constraint never being met.


