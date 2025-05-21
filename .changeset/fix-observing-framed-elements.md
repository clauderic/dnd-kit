---
'@dnd-kit/dom': patch
---

**PositionObserver**: Fixed a bug with observing elements contained within same origin iframes. Due to limitations with `IntersectionObserver`, we need to also attach position observers on the containing iframe to ensure the position of elements nested withing the iframe is updated if the iframe position changes.
