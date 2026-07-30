---
'@dnd-kit/dom': minor
---

Add support for custom scroll intent detection during auto-scrolling.

- `AutoScroller` accepts a new `detectScrollIntent` option that replaces the default detection logic. A custom detector can fully control the activation conditions and scroll parameters.
- The `Scroller.scroll` method accepts new `detectScrollIntent` and `onScroll` options. `onScroll` is a synchronous callback that fires right after the asynchronously scheduled scroll task actually applies a position change.
- The default `detectScrollIntent` implementation has been refactored into composable pure steps exported from `@dnd-kit/dom/utilities`: `detectActivation`, `suppressOpposingIntent`, `applyAcceleration`, `applyAxisInversion` and `stopAtBoundaries`.
