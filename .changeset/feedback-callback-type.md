---
'@dnd-kit/dom': minor
---

Support a callback form for the `feedback` option in the `Feedback` plugin, allowing the feedback type to be chosen dynamically based on the source and manager context (e.g. activator type).

```ts
Feedback.configure({
  feedback: (source, manager) => {
    return isKeyboardEvent(manager.dragOperation.activatorEvent)
      ? 'clone'
      : 'default';
  },
});
```
