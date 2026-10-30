---
'@dnd-kit/dom': patch
---

Fix auto-scroll in RTL scroll containers. `getScrollPosition` now exposes `position.min` and accounts for writing modes and reversed flex layouts when determining a container's horizontal scroll bounds.
