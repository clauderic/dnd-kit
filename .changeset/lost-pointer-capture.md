---
'@dnd-kit/dom': patch
---

_PointerSensor_: End drag operation if `lostpointercapture` event is fired and the drag operation has not ended already. This can happen if the `pointerup` event is fired in a different frame.
