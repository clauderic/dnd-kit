# @dnd-kit/marko

Marko v6 adapter for [@dnd-kit/dom](https://github.com/clauderic/dnd-kit). Provides drag-and-drop primitives as Marko tags using the `let-global` reactive pattern for context delivery.

## Installation

```bash
npm install @dnd-kit/marko @dnd-kit/dom
```

Add to your project's `marko.json` (or ensure it resolves via `node_modules`):

```json
{
  "tags-dir": "./node_modules/@dnd-kit/marko/tags"
}
```

Or if using a monorepo workspace, the tags are auto-discovered via the package's `marko.json`.

## Usage

### Basic sortable list

```marko
import {move} from '@dnd-kit/helpers';
import SortableItem from './SortableItem.marko';

<let/items=[1, 2, 3, 4, 5]>
<let/snapshot=[]>

<drag-drop-provider
  onDragStart() { snapshot = items.slice(); }
  onDragOver(event) { items = move(items, event); }
  onDragEnd(event) { if (event.canceled) items = snapshot; }
>
  <ul>
    <for|id, index| of=items by=(id) => id>
      <SortableItem id=id index=index/>
    </for>
  </ul>
</drag-drop-provider>
```

```marko
<!-- SortableItem.marko -->
export interface Input { id: number; index: number; }

<create-sortable|sortable| id=input.id index=input.index>
  <li/$el class=(sortable.isDragging ? 'dragging' : '')>
    <lifecycle
      onMount() { sortable.setElement($el()); }
      onDestroy() { sortable.setElement(undefined); }
    />
    ${input.id}
  </li>
</create-sortable>
```

---

## Tags

### `<drag-drop-provider>`

Root context provider. Creates and manages the `DragDropManager` and wires up event listeners. All consumer tags (`<create-draggable>`, `<create-droppable>`, `<create-sortable>`) must be rendered inside a provider.

**Attributes**

| Attribute           | Type                       | Description                                                          |
| ------------------- | -------------------------- | -------------------------------------------------------------------- |
| `manager`           | `DragDropManager`          | Use an externally created manager instead of creating one internally |
| `plugins`           | `Plugins`                  | Override the default plugin preset                                   |
| `sensors`           | `Sensors`                  | Override the default sensor preset                                   |
| `modifiers`         | `Modifiers`                | Override the default modifiers                                       |
| `onBeforeDragStart` | `(event, manager) => void` | Fired before drag begins                                             |
| `onDragStart`       | `(event, manager) => void` | Fired when drag starts                                               |
| `onDragMove`        | `(event, manager) => void` | Fired while dragging                                                 |
| `onDragOver`        | `(event, manager) => void` | Fired when dragging over a new target                                |
| `onDragEnd`         | `(event, manager) => void` | Fired when drag ends (check `event.canceled`)                        |
| `onCollision`       | `(event, manager) => void` | Fired on collision detection updates                                 |

**Body content**

The provider renders its body content (`<${input.content}/>`). All drag-and-drop tags inside the body have access to the manager via `let-global`.

---

### `<create-draggable>`

Creates a draggable entity. Use the body parameter (`|draggable|`) to access state and methods.

**Attributes**

| Attribute   | Type               | Description                                  |
| ----------- | ------------------ | -------------------------------------------- |
| `id`        | `string \| number` | Unique identifier for this draggable         |
| `data`      | `T`                | Custom data attached to the draggable entity |
| `disabled`  | `boolean`          | Disable dragging                             |
| `sensors`   | `Sensors`          | Per-entity sensor override                   |
| `modifiers` | `Modifiers`        | Per-entity modifier override                 |
| `plugins`   | `Plugins`          | Per-entity plugin override                   |

**Body parameter** (`DraggableMethods`)

| Property/Method  | Type                                     | Description                                   |
| ---------------- | ---------------------------------------- | --------------------------------------------- |
| `isDragging`     | `boolean`                                | Whether this item is currently being dragged  |
| `isDropping`     | `boolean`                                | Whether the drop animation is in progress     |
| `isDragSource`   | `boolean`                                | Whether this item is the active drag source   |
| `setElement(el)` | `(el: HTMLElement \| undefined) => void` | Register/unregister the draggable DOM element |
| `setHandle(el)`  | `(el: HTMLElement \| undefined) => void` | Register/unregister a drag handle element     |

**Example**

```marko
<create-draggable|draggable| id="item-1">
  <div/$el class=(draggable.isDragging ? 'dragging' : '')>
    <lifecycle
      onMount() { draggable.setElement($el()); }
      onDestroy() { draggable.setElement(undefined); }
    />
    Drag me
  </div>
</create-draggable>
```

**With drag handle**

```marko
<create-draggable|draggable| id="item-1">
  <div/$el class="item">
    <lifecycle
      onMount() { draggable.setElement($el()); }
      onDestroy() { draggable.setElement(undefined); }
    />
    Content
    <button/$handle class="handle" aria-label="Drag handle">
      <lifecycle
        onMount() { draggable.setHandle($handle()); }
        onDestroy() { draggable.setHandle(undefined); }
      />
    </button>
  </div>
</create-draggable>
```

---

### `<create-droppable>`

Creates a droppable target zone.

**Attributes**

| Attribute           | Type                | Description                                  |
| ------------------- | ------------------- | -------------------------------------------- |
| `id`                | `string \| number`  | Unique identifier for this droppable         |
| `data`              | `T`                 | Custom data attached to the droppable entity |
| `disabled`          | `boolean`           | Disable dropping                             |
| `accept`            | `Accept`            | Filter which draggables can be dropped here  |
| `type`              | `string`            | Droppable type for collision matching        |
| `collisionDetector` | `CollisionDetector` | Custom collision detection algorithm         |
| `collisionPriority` | `CollisionPriority` | Priority for collision resolution            |

**Body parameter** (`DroppableMethods`)

| Property/Method  | Type                                     | Description                                     |
| ---------------- | ---------------------------------------- | ----------------------------------------------- |
| `isDropTarget`   | `boolean`                                | Whether a draggable is currently over this zone |
| `setElement(el)` | `(el: HTMLElement \| undefined) => void` | Register/unregister the droppable DOM element   |

**Example**

```marko
<create-droppable|droppable| id="zone">
  <div/$el class=('zone' + (droppable.isDropTarget ? ' over' : ''))>
    <lifecycle
      onMount() { droppable.setElement($el()); }
      onDestroy() { droppable.setElement(undefined); }
    />
    Drop here
  </div>
</create-droppable>
```

---

### `<create-sortable>`

Creates a sortable entity — both draggable and droppable. Use with `move()` from `@dnd-kit/helpers` to reorder a list.

**Attributes**

| Attribute           | Type                 | Description                                     |
| ------------------- | -------------------- | ----------------------------------------------- |
| `id`                | `string \| number`   | Unique identifier for this sortable             |
| `index`             | `number`             | Current position in the list (must be reactive) |
| `group`             | `string`             | Group identifier for multi-list sorting         |
| `data`              | `T`                  | Custom data attached to the sortable entity     |
| `disabled`          | `boolean`            | Disable sorting                                 |
| `accept`            | `Accept`             | Filter which items can be sorted with this      |
| `type`              | `string`             | Sortable type for collision matching            |
| `transition`        | `SortableTransition` | Configure the sort transition animation         |
| `sensors`           | `Sensors`            | Per-entity sensor override                      |
| `modifiers`         | `Modifiers`          | Per-entity modifier override                    |
| `plugins`           | `Plugins`            | Per-entity plugin override                      |
| `collisionDetector` | `CollisionDetector`  | Custom collision detection algorithm            |
| `collisionPriority` | `CollisionPriority`  | Priority for collision resolution               |

**Body parameter** (`SortableMethods`)

| Property/Method  | Type                                     | Description                                 |
| ---------------- | ---------------------------------------- | ------------------------------------------- |
| `isDragging`     | `boolean`                                | Whether this item is being dragged          |
| `isDropping`     | `boolean`                                | Whether the drop animation is in progress   |
| `isDragSource`   | `boolean`                                | Whether this is the active drag source      |
| `isDropTarget`   | `boolean`                                | Whether a draggable is over this item       |
| `setElement(el)` | `(el: HTMLElement \| undefined) => void` | Register/unregister the primary element     |
| `setHandle(el)`  | `(el: HTMLElement \| undefined) => void` | Register/unregister a drag handle           |
| `setSource(el)`  | `(el: HTMLElement \| undefined) => void` | Register/unregister the drag source element |
| `setTarget(el)`  | `(el: HTMLElement \| undefined) => void` | Register/unregister the drop target element |

**Example with drag handle**

```marko
<create-sortable|sortable| id=input.id index=input.index>
  <li/$el class=(sortable.isDragging ? 'dragging' : '')>
    <lifecycle
      onMount() { sortable.setElement($el()); }
      onDestroy() { sortable.setElement(undefined); }
    />
    ${input.id}
    <button/$handle class="handle" aria-label="Drag handle">
      <lifecycle
        onMount() { sortable.setHandle($handle()); }
        onDestroy() { sortable.setHandle(undefined); }
      />
    </button>
  </li>
</create-sortable>
```

---

## Important: `index` must be reactive

The `index` attribute must reflect the item's current position in the list at every render. Since Marko's `<for>` provides the index as a body parameter, use it directly:

```marko
<for|id, index| of=items by=(id) => id>
  <SortableItem id=id index=index/>
</for>
```

The `by=` attribute on `<for>` is required for stable identity — without it, items lose their state on reorder.

## Nested providers

Nested `<drag-drop-provider>` instances with the same type will conflict (both write to the same `$global` key). This is a known v1 limitation. For most use cases — including single-table drag-and-drop — a single provider is sufficient.

## How context delivery works

This adapter uses Marko's `$global` object as a reactive context store via the internal `<let-global>` tag. The provider writes the `DragDropManager` to `$global.__dndKit_manager` during the render phase (before children render), so consumer tags see it immediately without timing issues. The `let-global` subscription system ensures consumers update reactively if the manager changes.

## License

MIT
