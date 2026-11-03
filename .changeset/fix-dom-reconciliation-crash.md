---
'@dnd-kit/dom': patch
---

Restore elements to their original DOM position on drag end to prevent framework DOM reconciliation crash (e.g. Node.removeChild error).
