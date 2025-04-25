---
'@dnd-kit/abstract': patch
---

Prevent race conditions in `dragOperation` when `actions.stop()` is invoked before `actions.start()` has completed.
