---
'@dnd-kit/abstract': patch
---

Fix modifiers passed to `DragDropProvider` being silently destroyed before they could take effect. An array reference comparison in the modifier lifecycle effect always evaluated to true, causing manager-level modifier instances to be destroyed and reassigned in a broken state on every drag start.
