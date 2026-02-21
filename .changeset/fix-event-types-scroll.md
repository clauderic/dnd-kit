---
'@dnd-kit/abstract': patch
'@dnd-kit/dom': patch
---

Fix exported event type aliases to extract the event object type rather than the callback signature. Rewrite `scrollIntoViewIfNeeded` with manual scroll calculations for more predictable behavior in nested scroll containers.
