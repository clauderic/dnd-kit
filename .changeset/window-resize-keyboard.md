---
'@dnd-kit/dom': patch
---

**KeyboardSensor**: Delegated the responsibility of ending the drag operation when the window resizes to the Feedback plugin, as we only need to end the operation if the feedback element's window resizes, which can be different from the source element window.
