---
'@dnd-kit/dom': patch
---

Defensive check in case getComputedStyle().transform is null. Could be the case on < Chrome 103
