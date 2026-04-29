---
'@dnd-kit/solid': patch
---

Fixed `DragDropProvider` evaluating its `children` JSX twice on initial mount in `@dnd-kit/solid`. The provider now strips `children` from the props it forwards to `DragDropManager`, preventing the manager constructor's spread (`{...input}`) from invoking Solid's `children` getter and synthesizing an orphan component subtree whose reactive scope was never disposed.
