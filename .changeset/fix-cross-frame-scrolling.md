---
'@dnd-kit/dom': patch
---

Fix a bug in the `Scroller` plugin that would always use `document.getElementFromPoint` instead of the document of the source element.
