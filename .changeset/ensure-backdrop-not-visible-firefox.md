---
'@dnd-kit/dom': patch
---

Added `visibility: hidden` to the `::backdrop` pseudo element of the `Feedback` plugin to ensure it is not visible on Firefox, there is a bug where it can be shown even with `display: none` when there is a backdrop filter applied to it.
