---
'@dnd-kit/dom': patch
---

Keep the Feedback plugin's styles injected between drag operations instead of adding and removing its `<style>` element on every drag. Each stylesheet change forces the browser to recalculate styles for the whole document, which caused jank at the start and end of drags on large pages. `StyleInjector.register()` accepts a new `retain` option for rules that are inert outside of a drag, and only adds or removes the stylesheets whose target roots actually changed.
