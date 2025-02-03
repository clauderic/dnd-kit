---
'@dnd-kit/dom': patch
---

Moved styles that override the default user agent styles for `[popover]` into a CSS layer to avoid overriding other layered styles on the page, such as Tailwind 4.
