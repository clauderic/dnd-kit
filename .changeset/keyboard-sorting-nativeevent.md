---
'@dnd-kit/dom': patch
---

Only handle `dragmove` events that have an associated `KeyboardEvent` as their `event.nativeEvent` property.
