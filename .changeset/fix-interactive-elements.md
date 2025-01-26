---
'@dnd-kit/dom': patch
---

Fix a bug with `event.preventDefault()` and `event.stopPropagation()` being called on pointer up even if there was no drag operation in progress, which would prevent interactive elements such as buttons from being clicked.
