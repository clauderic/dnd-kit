---
'@dnd-kit/dom': patch
---

Preserve custom data types when narrowing with `isSortable` and `isSortableOperation` instead of widening them to `any`. Source and target data types are inferred independently for sortable operations.
