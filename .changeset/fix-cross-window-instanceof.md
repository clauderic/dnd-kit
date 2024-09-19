---
'@dnd-kit/dom': patch
---

Fix issues with `instanceof` checks in cross-window environments where the `window` of an element can differ from the execution context window.
