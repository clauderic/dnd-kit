---
'@dnd-kit/dom': patch
---

Avoid requiring ResizeObserver at import time when importing @dnd-kit/dom/modifiers in DOM-like test environments.
