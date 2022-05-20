---
'@dnd-kit/sortable': minor
---

The `<SortableContext>` component now optionally accepts a `disabled` prop to globally disable `useSortable` hooks rendered within it.

The `disabled` prop accepts either a boolean or an object with the following shape:

```ts
interface Disabled {
  draggable?: boolean;
  droppable?: boolean;
}
```

The `useSortable` hook has now been updated to also optionally accept the `disabled` configuration object to conditionally disable the `useDraggable` and/or `useDroppable` hooks used internally.

Like the `strategy` prop, the `disabled` prop defined on the `useSortable` hook takes precedence over the `disabled` prop defined on the parent `<SortableContext>`.
