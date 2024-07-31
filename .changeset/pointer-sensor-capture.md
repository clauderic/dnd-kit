---
'@dnd-kit/dom': patch
---

Fix pointer events no longer being detected by the `PointerSensor` when the event target is disconnected from the DOM by setting pointer capture on the document body for `pointermove` events.
