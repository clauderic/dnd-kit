---
"@dnd-kit/core": patch
---

Fix duplicate scroll ancestor detection. In some scenarios, an element could be added twice to the list of detected scrollable ancestors, resulting in invalid offsets.
