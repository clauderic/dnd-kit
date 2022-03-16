---
'@dnd-kit/core': minor
---

Fixed a bug with the `delta` property returned in `onDragMove`, `onDragOver`, `onDragEnd` and `onDragCancel`. The `delta` property represents the `transform` delta since dragging was initiated, along with the scroll delta. However, due to an oversight, the `delta` property was actually returning the `transform` delta and the _current_ scroll offsets rather than the scroll _delta_.

This same change has been made to the `scrollAdjustedTranslate` property that is exposed to sensors.
