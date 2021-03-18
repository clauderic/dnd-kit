---
"@dnd-kit/core": minor
---

Added `onActivation` option to sensors. Delegated the responsibility of calling `event.preventDefault()` on activation to consumers, as consumers have the most context to decide whether it is appropriate or not to prevent the default browser behaviour on activation. Consumers of the sensors can prevent the default behaviour on activation using the `onActivation` option. Here is an example using the Pointer sensor: `useSensor(PointerSensor, {onActivation: (event) => event.preventDefault()})`
