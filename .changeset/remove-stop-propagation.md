---
'@dnd-kit/dom': patch
---

Remove `event.stopImmediatePropagation()` in `PointerSensor` and replace with a different strategy to prevent other instances of PointerSensor from tracking an event that was already captured by another sensor.
