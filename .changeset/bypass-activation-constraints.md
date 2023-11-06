---
'@dnd-kit/core': minor
---

Introduce `bypassActivationConstraint()` option for `PointerSensor`, `MouseSensor` and `TouchSensor`. This optional argument can be used to conditionally bypass activation constraints. An example use-case would be to bypass activation constraints when the activator event target is the `activatorNode` of a draggable source.

```tsx
useSensor(PointerSensor, {
  activationConstraint: {
    delay: 250,
    tolerance: 5,
  },
  bypassActivationConstraint({event, activeNode}) {
    return activeNode.activatorNode.current?.contains(event.target);
  },
});
```
