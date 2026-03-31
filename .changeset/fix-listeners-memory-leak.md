---
"@dnd-kit/dom": patch
---

Fixed memory leak in `Listeners` class where the `bind` cleanup function did not remove entries from the internal `entries` set, causing detached DOM nodes to be retained in memory.
