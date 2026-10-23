---
'@dnd-kit/dom': patch
---

Only follow the pointer that started a drag operation in the `PointerSensor`. Moving, releasing or canceling another pointer, such as a second finger on a touch screen, no longer moves, drops or cancels the drag, or aborts a pending activation.
