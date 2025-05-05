---
'@dnd-kit/dom': patch
---

Moved the CSS variables to the `[data-dnd-root]` element, which defaults to the `document.body` of the source element to avoid triggering `MutationObserver` callbacks every time the `--dnd-translate` CSS variable is updated.
