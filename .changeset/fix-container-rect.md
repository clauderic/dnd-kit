---
'@dnd-kit/core': patch
---

Fixed an issue with the `containerNodeRect` that is exposed to modifiers having stale properties (`top`, `left`, etc.) when its scrollable ancestors were scrolled.
