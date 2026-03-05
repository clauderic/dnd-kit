---
'@dnd-kit/dom': patch
---

Fix Feedback plugin placeholder not repositioning when siblings are moved around a stationary source element.

When a VDOM framework (e.g., Preact, Vue) reorders sibling elements during a drag operation, the source element and placeholder may remain in the DOM but no longer be adjacent. The existing `documentMutationObserver` only handled cases where the source or placeholder itself was re-added to the DOM. This adds a fallback adjacency check after processing all mutation entries, ensuring the placeholder stays next to the source element regardless of how siblings are rearranged.
