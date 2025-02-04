---
'@dnd-kit/react': patch
---

Force synchronous re-render when `isDragSource` property is updated from `true` to `false` to enable seamless transition into idle state after drop animation. Without this change, the drop animation can finish before React has had a chance to update the drag source styles back to its idle state, which can cause some flickering.
