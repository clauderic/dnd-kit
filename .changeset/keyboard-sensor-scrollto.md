---
'@dnd-kit/core': patch
---

The `KeyboardSensor` was updated to use `scrollTo` instead of `scrollBy` when it is able to fully scroll to the new coordinates returned by the coordinate getter function. This resolves issues that can happen with `scrollBy` when called in rapid succession.
