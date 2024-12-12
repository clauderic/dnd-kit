---
'@dnd-kit/dom': patch
---

Use fixed event listeners in PointerSensor to address race conditions preventing `pointermove` and `pointerup` events from firing when document changes during a drag.
