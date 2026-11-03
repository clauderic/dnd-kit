---
'@dnd-kit/dom': patch
---

Batch the animations of sortables that move at the same time. Each sortable used to cancel its transitions, measure its position and start its animation on its own, so every measurement forced the browser to recompute layout after the previous sortable's animation. Sortables that move together are now prepared, then measured, then animated as one batch, so layout is computed once instead of once per sortable.
