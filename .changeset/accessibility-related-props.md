---
'@dnd-kit/core': major
---

Accessibility related changes.

#### Regrouping accessibility-related props

Accessibility-related props have been regrouped under the `accessibility` prop of `<DndContext>`:

```diff
<DndContext
- announcements={customAnnouncements}
- screenReaderInstructions={customScreenReaderInstructions}
+ accessibility={{
+  announcements: customAnnouncements,
+  screenReaderInstructions: customScreenReaderInstructions,
+ }}
```

This is a breaking change that will allow easier addition of new accessibility-related features without overloading the props namespace of `<DndContext>`.

#### Arguments object for announcements

The arguments passed to announcement callbacks have changed. They now receive an object that contains the `active` and `over` properties that match the signature of those passed to the DragEvent handlers (`onDragStart`, `onDragMove`, etc.). This change allows consumers to read the `data` property of the `active` and `over` node to customize the announcements based on the data.

Example migration steps:

```diff
export const announcements: Announcements = {
-  onDragStart(id) {
+  onDragStart({active}) {
-    return `Picked up draggable item ${id}.`;
+    return `Picked up draggable item ${active.id}.`;
  },
-  onDragOver(id, overId) {
+  onDragOver({active, over}) {
-    if (overId) {
+    if (over) {
-      return `Draggable item ${id} was moved over droppable area ${overId}.`;
+      return `Draggable item ${active.id} was moved over droppable area ${over.id}.`;
    }

-    return `Draggable item ${id} is no longer over a droppable area.`;
+    return `Draggable item ${active.id} is no longer over a droppable area.`;
  },
};
```

#### Accessibility-related DOM nodes are no longer portaled by default

The DOM nodes for the screen reader instructions and announcements are no longer portaled into the `document.body` element by default.

This change is motivated by the fact that screen readers do not always announce ARIA live regions that are rendered on the `document.body`. Common examples of this include when rendering a `<DndContext>` within a `<dialog>` element or an element that has `role="dialog"`, only ARIA live regions rendered within the dialog will be announced.

Consumers can now opt to render announcements in the portal container of their choice using the `container` property of the `accessibility` prop:

```diff
<DndContext
+ accessibility={{
+  container: document.body,
+ }}
```
