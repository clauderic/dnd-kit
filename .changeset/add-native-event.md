---
'@dnd-kit/abstract': patch
'@dnd-kit/dom': patch
---

Added `nativeEvent` property to `dragstart`, `dragmove` and `dragend` events. This can be used to distinguish user triggered events from sensor triggered events, as user or plugin triggered events will typically not have an associated `event` attached.
