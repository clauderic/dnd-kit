---
'@dnd-kit/core': patch
---

Enable consumers to customize trigger function for sencers using the `triggerFunction` option. Here is example using the Pointer sensor only trigger on 'pen' pointerType: `useSensor(PointerSensor, {triggerFunction: (event) => event.pointerType === 'pen'})`
