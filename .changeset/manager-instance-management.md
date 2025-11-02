---
'@dnd-kit/react': patch
---

Simplified instance management of `manager` to fix a bug where the `manager` returned by `useDragDropManager` was `null` on first mount.
