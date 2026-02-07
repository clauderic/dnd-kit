---
'@dnd-kit/abstract': patch
---

Fix TypeScript type incompatibility when using abstract modifiers (`RestrictToVerticalAxis`, `RestrictToHorizontalAxis`, `SnapModifier`) with DOM or React `DragDropManager`. The `AxisModifier` and `SnapModifier` classes no longer over-constrain their generic manager type parameter.
