---
'@dnd-kit/abstract': minor
'@dnd-kit/dom': minor
'@dnd-kit/react': minor
'@dnd-kit/solid': minor
'@dnd-kit/vue': minor
'@dnd-kit/svelte': minor
---

Added per-entity plugin configuration and moved `feedback` from the Draggable entity to the Feedback plugin.

Draggable entities now accept a `plugins` property for per-entity plugin configuration, using the existing `Plugin.configure()` pattern. Plugins can read per-entity options via `source.pluginConfig(PluginClass)`.

The `feedback` property (`'default' | 'move' | 'clone' | 'none'`) has been moved from the Draggable entity to `FeedbackOptions`. Drop animation can also now be configured per-draggable.

The `DropAnimationFunction` context now includes `source`, providing access to the draggable entity for conditional animation logic.

### Migration guide

The `feedback` property has been moved from the draggable/sortable hook input to per-entity Feedback plugin configuration.

**Before:**

```tsx
import { FeedbackType } from '@dnd-kit/dom';

useDraggable({ id: 'item', feedback: 'clone' });
useSortable({ id: 'item', index: 0, feedback: 'clone' });
```

**After:**

```tsx
import { Feedback } from '@dnd-kit/dom';

useDraggable({
  id: 'item',
  plugins: [Feedback.configure({ feedback: 'clone' })],
});
useSortable({
  id: 'item',
  index: 0,
  plugins: [Feedback.configure({ feedback: 'clone' })],
});
```

Drop animation can now be configured per-draggable:

```tsx
useDraggable({
  id: 'item',
  plugins: [Feedback.configure({ feedback: 'clone', dropAnimation: null })],
});
```

Custom drop animation functions now receive the `source` draggable in their context:

```tsx
Feedback.configure({
  dropAnimation: async (context) => {
    if (context.source.type === 'service-draggable') return;
    // custom animation...
  },
});
```
