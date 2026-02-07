---
'@dnd-kit/dom': patch
---

**Feedback plugin**: Fix table cell width handling during drag operations. Use `getBoundingClientRect().width` instead of `offsetWidth` for sub-pixel precision, and restore original cell widths after dragging ends instead of leaving hardcoded values permanently.
