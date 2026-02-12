---
'@dnd-kit/dom': patch
'@dnd-kit/react': patch
'@dnd-kit/solid': patch
---

Add `dropAnimation` prop to the `DragOverlay` component to allow consumers to disable or customize the drop animation that plays when a drag operation ends. Set to `null` to disable, pass `{duration, easing}` to customize timing, or provide a custom animation function for full control.
