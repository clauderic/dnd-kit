---
'@dnd-kit/dom': patch
---

Added `aria-grabbed` to the list of attributes added by the Accessibility plugin.

Setting aria-grabbed to true indicates that the element has been selected for dragging. Setting aria-grabbed to false indicates that the element can be grabbed for a drag-and-drop operation, but is not currently grabbed.

While the `aria-grabbed` attribute has been deprecated in ARIA 1.1, in practice, since the accessibility API features for accessible drag and drop still don’t exist and likely won’t for several years, these attributes will continue to be supported by browsers and reflected in the accessibility tree for some years to come until a new API is introduced to replace it.
