---
'@dnd-kit/dom': patch
---

Fix `PositionObserver` observing an element that a scrollable ancestor clips again every 75ms, forever, even when nothing moves.
