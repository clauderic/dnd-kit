---
'@dnd-kit/dom': patch
---

Keep the hidden placeholder fully hidden when its content sets `visibility: visible`, such as SVG paths exported with that inline style. Descendants of the placeholder no longer show through in the original position while dragging.
