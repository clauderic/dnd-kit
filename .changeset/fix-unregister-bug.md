---
'@dnd-kit/abstract': patch
---

Make sure the cleanup function of effects is invoked when registering a new instance with the same `id` before the old instance has been unregistered.
