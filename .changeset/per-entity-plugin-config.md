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

Plugins listed in an entity's `plugins` array are auto-registered on the manager if not already present. The Sortable class now uses this generic mechanism instead of its own custom registration logic.

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
