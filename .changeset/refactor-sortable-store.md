---
'@dnd-kit/dom': patch
'@dnd-kit/state': patch
---

Refactor Sortable store implementation to use a new `WeakStore` class

- Add new `WeakStore` constructor in `@dnd-kit/state` package
- Replace Map-based store implementation in Sortable with new WeakStore utility
