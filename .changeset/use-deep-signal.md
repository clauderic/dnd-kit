---
'@dnd-kit/react': patch
---

Introduce `useDeepSignal` hook, which keeps track of which properties are read on an object and automatically re-renders the component when a read signal changes.
