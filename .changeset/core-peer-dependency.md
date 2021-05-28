---
'@dnd-kit/modifiers': minor
'@dnd-kit/sortable': minor
---

`@dnd-kit/core` is now a `peerDependency` rather than a `dependency` for other `@dnd-kit` packages that depend on it, such as `@dnd-kit/sortable` and `@dnd-kit/modifiers`. This is done to avoid issues with multiple versions of `@dnd-kit/core` being installed by some package managers such as Yarn 2.
