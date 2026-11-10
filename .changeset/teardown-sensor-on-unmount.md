---
'@dnd-kit/core': patch
---

Fixed `DndContext` leaving the event listeners of the active sensor attached when it unmounts during a drag operation, which could cause subsequent keyboard and pointer events to be intercepted. Sensors can now implement an optional `teardown()` method, which is called when the `DndContext` unmounts while the sensor is active. The built-in sensors implement this method.
