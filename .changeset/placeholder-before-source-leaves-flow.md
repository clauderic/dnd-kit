---
'@dnd-kit/dom': patch
---

Insert the `Feedback` placeholder before the source element is taken out of the document flow, so the scrollable content never shrinks and a container scrolled to its end keeps its offset when a drag starts (Safari).
