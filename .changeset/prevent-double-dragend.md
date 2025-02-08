---
'@dnd-kit/dom': patch
---

Fixed a regression in the `PointerSensor` where the same drag operation could fire a dragend event twice due to a race condition between `pointerup` and `lostpointercapture`.
