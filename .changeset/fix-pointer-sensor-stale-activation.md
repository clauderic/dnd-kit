---
'@dnd-kit/dom': patch
---

Fixed `setPointerCapture` error on touch devices caused by stale pointer activation.

When a touch was released during the activation delay and followed by a quick re-touch, the pending delay timer from the first touch could fire with a stale `pointerId`, causing `setPointerCapture` to throw. The `PointerSensor` now properly aborts the activation controller during cleanup to cancel pending delay timers, and defensively handles `setPointerCapture` failures.
