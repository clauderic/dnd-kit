---
'@dnd-kit/abstract': patch
'@dnd-kit/dom': patch
---

Fix handling of aborted drag operations across sensors. The `start` method now returns a boolean to indicate whether the operation was aborted, allowing sensors to properly clean up when a drag operation is prevented. This affects the Keyboard and Pointer sensors, ensuring they properly handle cases where `beforeDragStart` events are prevented.
