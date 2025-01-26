---
'@dnd-kit/react': patch
---

Use layout effect to register instances in the `useInstance` hook. This fixes issues with effects running after the browser has painted during drag operations, which can result in invalid shapes or flickering.
