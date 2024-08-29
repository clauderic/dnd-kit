---
'@dnd-kit/dom': patch
---

**PointerSensor**: Defer invoking `setPointerCapture` until activation constraints are met as it can interfere with `click` and other event handlers. Also deferred adding `touchmove`, `click` and `keydown` event listeners until the activation constraints are met.
