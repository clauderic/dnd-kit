---
'@dnd-kit/abstract': patch
---

Register and unregister entities in constant time. `EntityRegistry` no longer copies its map and scans every entry on each call, so mounting or unmounting n entities is linear instead of quadratic. Readers are still notified on every change and still iterate a stable snapshot.
