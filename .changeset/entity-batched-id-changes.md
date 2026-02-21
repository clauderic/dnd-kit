---
'@dnd-kit/abstract': minor
'@dnd-kit/dom': minor
---

Batch entity identity changes to prevent collision oscillation during virtualized sorting.

When entities swap ids (e.g. as `react-window` recycles DOM nodes during a drag), multiple registry updates could fire in an interleaved order, causing the collision detector to momentarily see stale or duplicate entries and oscillate between targets.

Entity `id` changes are now deferred to a microtask and flushed atomically in a single `batch()`, ensuring:
- The collision notifier skips detection while id changes are pending
- The registry cleans up ghost registrations (stale keys left behind after an id swap)
