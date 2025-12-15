---
'@dnd-kit/dom': minor
---

- Add `preventActivation` option to `PointerSensor` and `KeyboardSensor` to conditionally prevent sensor activation.
- **PointerSensor**: The default `preventActivation` prevents activation when the pointer target is an interactive element (input, select, textarea, button, link, or contenteditable) that is not the source element or handle.
- **KeyboardSensor**: Renamed `shouldActivate` to `preventActivation` with inverted logic—return `true` to prevent activation instead of returning `true` to allow it.
- New utility: `isInteractiveElement(element)` checks if an element is an interactive form control or link.
