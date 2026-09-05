---
'@dnd-kit/abstract': minor
'@dnd-kit/collision': patch
'@dnd-kit/dom': patch
---

Prevent layout feedback from repeatedly changing collision targets in auto-height columns and nested sortable layouts, while preserving immediate direction changes.

Default rectangular collision detection now uses the initial drag footprint translated by the resolved transform, and ranks intersecting shapes by distance to their nearest edge. Visual feedback can resize without admitting a different destination; explicit shape detectors and custom detectors continue to receive live geometry.

Collision observation coalesces geometry and input changes, retains pending results through rendering and public suspension, and reconciles the latest accepted input before drop. DOM rendering now includes batched collision measurement, covering both synchronous placement commits and layout written by returned asynchronous handlers without sortable-specific measurement bookkeeping. Measurements also refresh on scroll events and project newly started ancestor animations without a cached animation list. Strict descendants of the dragged subtree are excluded from collision candidates.

Promises returned directly from action-owned `dragmove` and `dragover` listeners now contribute to action completion. Target actions finish their handlers and rendering before another collision decision or normal drop; default pointer movement remains immediate and cancellation does not wait. Relative commands are sequenced inside the action layer. Completed target actions consume the collision result of their own layout so stationary nested-grid transfers cannot trigger another placement merely by changing that result. Keyboard commands finish as part of their original input without an extra synthetic `dragmove` for position compensation. Application options, event fields, detector signatures, package exports, and the generic `Plugin` class are unchanged.
