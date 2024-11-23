---
'@dnd-kit/accessibility': patch
---

Workaround `<LiveRegion>` layout bug by adding explicit `top` and `left`
attributes. Under sufficiently complex CSS conditions, the element would
overflow containers that it's not supposed to. See [this
post](https://blog.duvallj.pw/posts/2024-11-19-chrome-heisenbug-uncovered.html)
for a complete explanation.
