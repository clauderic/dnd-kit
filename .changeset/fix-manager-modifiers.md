---
'@dnd-kit/abstract': patch
'@dnd-kit/dom': patch
'@dnd-kit/react': patch
---

Fix global modifiers set on `DragDropManager` / `<DragDropProvider>` being destroyed after the first drag operation.
