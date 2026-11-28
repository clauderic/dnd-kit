---
'@dnd-kit/dom': patch
---

Reserve the lowest-priority `dnd-kit` cascade layer early and append its rules at drag start to avoid rebuilding the document's cascade layers.
