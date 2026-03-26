---
'@dnd-kit/dom': minor
---

Sortable `plugins` now accepts `Customizable<Plugins>`, allowing a function that receives the default plugins to extend them rather than replace them.

This prevents accidentally losing the default Sortable plugins (`SortableKeyboardPlugin`, `OptimisticSortingPlugin`) when adding per-entity plugin configuration such as `Feedback.configure()`.

```ts
// Extend defaults
useSortable({
  id: 'item',
  index: 0,
  plugins: (defaults) => [...defaults, Feedback.configure({ feedback: 'clone' })],
});

// Replace defaults (same behavior as before)
useSortable({
  id: 'item',
  index: 0,
  plugins: [MyPlugin],
});
```
