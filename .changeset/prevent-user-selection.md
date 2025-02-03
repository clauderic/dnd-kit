---
'@dnd-kit/dom': patch
---

- Fixed an invalid CSS selector in the `PreventSelection` plugin
- Removed logic to prevent user selection in `Feedback` plugin (defer to `PreventSelection` plugin to handle this)
