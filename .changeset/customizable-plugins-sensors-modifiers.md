---
'@dnd-kit/abstract': minor
'@dnd-kit/dom': minor
'@dnd-kit/react': minor
'@dnd-kit/vue': minor
'@dnd-kit/svelte': minor
'@dnd-kit/solid': minor
---

Allow `plugins`, `sensors`, and `modifiers` to accept a function that receives the defaults, making it easy to extend or configure them without replacing the entire array.

```ts
// Add a plugin alongside the defaults
const manager = new DragDropManager({
  plugins: (defaults) => [...defaults, MyPlugin],
});
```

```tsx
// Configure a default plugin in React
<DragDropProvider
  plugins={(defaults) => [...defaults, Feedback.configure({ dropAnimation: null })]}
/>
```

Previously, passing `plugins`, `sensors`, or `modifiers` would replace the defaults entirely, requiring consumers to import and spread `defaultPreset`. The function form receives the default values as an argument, so consumers can add, remove, or configure individual entries without needing to know or maintain the full default list.
