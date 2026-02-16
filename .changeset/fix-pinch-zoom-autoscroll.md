---
'@dnd-kit/dom': patch
---

Fix auto-scroll trigger zones and boundaries during pinch-to-zoom.

Updated `getViewportBoundingRectangle`, `getVisibleBoundingRectangle`, and `getScrollPosition` to use the Visual Viewport API, so that scroll detection and element visibility clipping are based on the actual visible area rather than the layout viewport. This fixes auto-scroll not triggering near the visible edges and stopping before reaching the end of scrollable content when the page is zoomed in.
