---
'@dnd-kit/dom': patch
---

Reuse each scroll container's position measurement during auto-scrolling to avoid duplicate layout reads while preserving the existing scroll utility argument order.
