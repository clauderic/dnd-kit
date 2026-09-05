---
'@dnd-kit/abstract': patch
'@dnd-kit/collision': patch
'@dnd-kit/dom': patch
---

Prevent layout feedback from repeatedly changing collision targets in auto-height columns and nested sortable layouts, while preserving immediate direction changes.

Default rectangular collision detection now uses the initial drag footprint translated by the resolved transform, and ranks intersecting shapes by distance to their nearest edge. Visual feedback can resize without admitting a different destination; explicit shape detectors and custom detectors continue to receive live geometry.

Collision observation coalesces geometry and input changes, retains pending results through rendering and public suspension, and reconciles the latest accepted input before drop. Sorting and keyboard operations own independent internal transactions. DOM measurements refresh after placement commits and scroll events, and strict descendants of the dragged subtree are excluded from collision candidates.
