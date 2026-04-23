---
"@dnd-kit/dom": patch
---

Fixed autoscroll failing when sortable items are inside a `position: sticky` container. The `isFixed` utility was incorrectly treating sticky-positioned elements the same as fixed-positioned elements, which caused `getScrollableAncestors` to stop traversal at the sticky element and skip the actual scrollable container.
