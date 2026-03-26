---
'@dnd-kit/dom': minor
---

Rewrite `scrollIntoViewIfNeeded` with manual offset calculations for correct behavior in nested scroll containers. The `centerIfNeeded` boolean parameter has been replaced with an options object accepting `block` and `inline` properties (`'center'`, `'nearest'`, or `'none'`).
