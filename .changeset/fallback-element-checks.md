---
'@dnd-kit/dom': patch
---

Add fallback logic to type-guards when instance checks fail to identify instances, for example to test if an element is an `Element` or `HTMLElement` or `SVGElement`, or if an `AnimationEffect` is a `KeyframeEffect`.
