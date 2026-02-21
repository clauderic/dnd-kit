---
'@dnd-kit/dom': minor
'@dnd-kit/react': patch
---

Animation resolution now uses last-wins semantics matching CSS composite order. The Feedback plugin supports full CSS `transform` property for compatibility with libraries like react-window v2 that position elements via transforms. The ResizeObserver computes shapes from CSS values rather than re-measuring the element, avoiding mid-transition measurement errors.
