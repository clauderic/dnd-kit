---
'@dnd-kit/core': patch
---

The TouchSensor attempts to prevent the default browser behavior of scrolling the page by calling `event.preventDefault()` in the `touchmove` event listener. This wasn't working in iOS Safari due to a bug with dynamically attached `touchmove` event listeners. Adding a non-passive, non-capture `touchmove` event listener before dynamically attaching other `touchmove` event listeners solves the issue.
