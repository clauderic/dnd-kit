---
'@dnd-kit/dom': patch
---

Animation resolution now uses last-wins semantics matching CSS composite order. `getFinalKeyframe` returns the last matching keyframe across all running animations instead of short-circuiting on the first match. `getProjectedTransform` collects the latest value per CSS property (`transform`, `translate`, `scale`) rather than accumulating transforms additively.
