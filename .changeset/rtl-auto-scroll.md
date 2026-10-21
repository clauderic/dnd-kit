---
'@dnd-kit/dom': patch
---

Fix auto-scroll in RTL scroll containers. `getScrollPosition` now exposes `position.min`, and the horizontal scroll range is `[-max, 0]` when the container's direction is `rtl`.
