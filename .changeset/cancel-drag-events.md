---
"@dnd-kit/core": minor
---

Mouse, Pointer, Touch sensors now cancel dragging on [visibility change](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event) and [window resize](https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event). The Keyboard sensor already cancelled dragging on window resize. It now also cancels dragging on visibility change.
