---
'@dnd-kit/dom': minor
---

Add `keyboardTransition` option to the `Feedback` plugin for customizing or disabling the CSS transition applied when moving elements via keyboard.

By default, keyboard-driven moves animate with `250ms cubic-bezier(0.25, 1, 0.5, 1)`. You can now customize the `duration` and `easing`, or set the option to `null` to disable the transition entirely.

```ts
Feedback.configure({
  keyboardTransition: { duration: 150, easing: 'ease-out' },
})
```
