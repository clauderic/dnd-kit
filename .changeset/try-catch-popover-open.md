---
'@dnd-kit/dom': patch
---

Added a `try` / `catch` in `showPopover` and `hidePopover` as the `element.matches(':popover-open')` selector can throw in browsers that don't support the Popover API.
