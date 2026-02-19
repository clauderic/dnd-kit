---
'@dnd-kit/dom': minor
---

Add `acceleration` and `threshold` options to the `AutoScroller` plugin.

- `acceleration` controls the base scroll speed multiplier (default: `25`).
- `threshold` controls the percentage of container dimensions that defines the scroll activation zone (default: `0.2`). Accepts a single number for both axes or `{ x, y }` for per-axis control. Setting an axis to `0` disables auto-scrolling on that axis.

```ts
AutoScroller.configure({
  acceleration: 15,
  threshold: { x: 0, y: 0.3 },
})
```
