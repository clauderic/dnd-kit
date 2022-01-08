---
'@dnd-kit/utilities': patch
---

- The `useNodeRef` hook's `onChange` argument now receives both the current node and the previous node that were attached to the ref.
- The `onChange` argument is only called if the previous node differs from the current node
