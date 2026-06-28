---
"@dnd-kit/dom": patch
---

Fix dragged element jumping by one row in Safari when a scroll container (the page or a nested scrollable element) is scrolled to (or near) its end. Taking the source element out of the document flow shrinks the scrollable content, which clamps the scroll offset at the scroll extreme. The `Feedback` plugin now captures the scroll offsets of every scrollable ancestor before promoting the source element and restores them once the placeholder has restored the content size, keeping the drag feedback aligned with its origin.
