---
'@dnd-kit/dom': minor
---

The Feedback plugin now supports full CSS `transform` property for compatibility with libraries like react-window v2 that position elements via transforms. Transform-related CSS transitions are filtered out to prevent conflicts with Feedback-managed properties. The ResizeObserver computes shapes from CSS values rather than re-measuring the element, avoiding mid-transition measurement errors. Sortable's `animate()` cancels CSS transitions on transform-related properties before measuring to ensure correct FLIP deltas.
