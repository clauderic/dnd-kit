---
'@dnd-kit/dom': patch
---

Fixed a bug with the drop animation by using `intrinsicWidth` and `intrinsicHeight` to determine if the width and height of the source and target differ or not rather than the `width` and `height` properties which may be transformed.
