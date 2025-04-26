---
'@dnd-kit/abstract': patch
'@dnd-kit/dom': patch
---

Improve drag operation control by:

- Introducing `AbortController` for better operation lifecycle management
- Remove `requestAnimationFram()` from `start()` action
- Replacing boolean returns with proper abort control
- Ensure proper cleanup of drag operations
- Improving status handling and initialization checks
- Making feedback plugin respect operation initialization state
