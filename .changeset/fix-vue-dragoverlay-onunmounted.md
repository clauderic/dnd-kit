---
"@dnd-kit/vue": patch
---

Fix `onUnmounted` warning in Vue `DragOverlay` by using `watchEffect`'s `onCleanup` callback instead of the `onUnmounted` lifecycle hook
