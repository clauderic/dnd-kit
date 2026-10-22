---
'@dnd-kit/dom': patch
---

Check the `touch-action` CSS property before allowing touch-based dragging: activation is now prevented when the activator's `touch-action` is not `none`, since the browser would cancel the pointer stream for scrolling anyway.
