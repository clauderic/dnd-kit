---
'@dnd-kit/state': patch
---

Copy snapshot properties as own data properties so an enumerable `__proto__` key cannot change the returned object's prototype. Preserve inherited enumerable getters and untracked reads. This prevents returned-object prototype injection when snapshotting untrusted data; downstream impact depends on how consumers use that snapshot.
