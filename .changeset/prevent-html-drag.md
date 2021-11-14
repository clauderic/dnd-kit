---
'@dnd-kit/core': patch
---

Sensors that extend the `AbstractPointerSensor` now prevent [HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) events from being triggered while the sensor is activated.
