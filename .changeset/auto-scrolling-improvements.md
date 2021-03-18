---
"@dnd-kit/core": minor
"@dnd-kit/sortable": minor
---

Auto-scrolling improvements. The auto-scroller now bases its calculations based on the position of the pointer rather than the edges of the draggable element's rect. This change is aligned with how the native HTML 5 Drag & Drop auto-scrolling behaves. The auto-scroller now also looks at scrollable ancestors in reverse order by default, meaning it will first attempt to scroll the window, and narrow its focus down rather than the old behaviour of looking at scrollable ancestors in order of closeness to the draggable element in the DOM tree. This generally leads to an improved user experience, but can be customized by passing a configuration object to the `autoScroll` prop that includes a custom `sortScrollableAncestors` function.
