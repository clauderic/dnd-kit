---
'@dnd-kit/dom': patch
'@dnd-kit/state': patch
---

Refactor Sortable store implementation to use a new `createStore` utility

- Add new `createStore` utility function in `@dnd-kit/state` package
- Replace Map-based store implementation in Sortable with new store utility
- Export `createStore` from `@dnd-kit/state` package
