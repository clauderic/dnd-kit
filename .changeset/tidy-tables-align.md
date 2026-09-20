'@dnd-kit/dom': patch
---

Reset the inherited `border-spacing` of table-internal elements (rows, cells, headers) while they are dragged. Fixed positioning blockifies these elements and the anonymous table boxes generated around their contents inherit `border-spacing`, which offset the dragged element from its pre-drag position.
