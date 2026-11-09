---
'@dnd-kit/dom': patch
---

Fixed sortable animations overshooting and jumping when the list is rendered inside a scaled ancestor, such as a zoomable canvas with `transform: scale(...)`. The animation offset is measured in screen pixels and is now converted to the element's own coordinate space before it's applied as a `translate`.
