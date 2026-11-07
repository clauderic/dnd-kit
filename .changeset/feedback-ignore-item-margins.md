---
'@dnd-kit/dom': patch
---

Fixed the dragged element being offset by its own margins. The Feedback plugin positions the element with `top` and `left`, so margins set inline or by stylesheets on sortable and draggable items no longer shift it away from the pointer.
