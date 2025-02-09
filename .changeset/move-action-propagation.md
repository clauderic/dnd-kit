---
'@dnd-kit/abstract': patch
---

Added the option to trigger `move` actions that are not propagated to `dragmove` listeners. This can be useful when firing a `dragmove` action in response to another `dragmove` event to avoid an infinite loop.
