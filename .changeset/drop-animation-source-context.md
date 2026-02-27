---
'@dnd-kit/dom': minor
---

The `DropAnimationFunction` context now includes `source`, providing access to the draggable entity for conditional animation logic.

```tsx
Feedback.configure({
  dropAnimation: async (context) => {
    if (context.source.type === 'service-draggable') return;
    // custom animation...
  },
});
```
