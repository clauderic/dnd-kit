---
'@dnd-kit/dom': patch
---

Fix drag overlay and debug overlay mispositioning in Safari during pinch-to-zoom.

Safari anchors `position: fixed` elements to the visual viewport rather than the layout viewport during pinch-to-zoom. Added a `getFixedPositionOffset()` utility that compensates for this by adding `visualViewport.offsetLeft/Top` to the CSS `left`/`top` values of fixed-positioned overlays.
