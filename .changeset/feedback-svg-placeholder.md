---
'@dnd-kit/dom': patch
---

Fix clone feedback placeholder dropping inline SVG children during mutation sync.

The element mutation observer used `innerHTML` to sync child changes from the dragged element to its placeholder. This text-based serialization loses SVG namespace information, causing inline SVG elements (e.g. icon components) to be stripped from the placeholder. The placeholder then measures with incorrect dimensions, producing a misaligned drop animation.

Replaced `innerHTML` with `replaceChildren(...element.cloneNode(true).childNodes)`, which performs a namespace-aware deep clone.
