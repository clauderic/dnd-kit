---
"@dnd-kit/dom": patch
---

Fixed a bug where custom `PointerSensor` options passed to the `bind()` method were not being respected by the `activationConstraints()` method.
