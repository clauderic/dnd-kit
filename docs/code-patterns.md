# dnd-kit Code Patterns

This document covers the key abstractions, reactive state system, extensibility patterns, and coding conventions used throughout the dnd-kit codebase. It is intended for developers who want to contribute to or extend the library.

## Table of Contents

- [Key Abstractions](#key-abstractions)
- [Reactive State Management](#reactive-state-management)
- [Extensibility Patterns](#extensibility-patterns)
- [Naming Conventions and Code Style](#naming-conventions-and-code-style)

---

## Key Abstractions

### Entity

`Entity` is the base class for all identifiable items in the drag-and-drop system. Both `Draggable` and `Droppable` extend it.

```typescript
// packages/abstract/src/core/entities/entity/entity.ts

class Entity<
  T extends Data = Data,
  U extends DragDropManager<any, any> = DragDropManager<any, any>,
> {
  constructor(input: Input<T>, manager: U | undefined);

  @reactive public accessor manager: U | undefined;
  @reactive public accessor id: UniqueIdentifier;
  @reactive public accessor data: Data;
  @reactive public accessor disabled: boolean;

  public effects: () => Effect[];
  public register(): CleanupFunction | void;
  public unregister(): void;
  public destroy(): void;
}
```

Where:
- `UniqueIdentifier` = `string | number`
- `Data` = `Record<string, any>`
- `Type` = `Symbol | string | number`

Entities self-register with the manager via `queueMicrotask(this.register)` in the constructor. The `effects()` factory returns an array of reactive effects that are activated when the entity is registered and cleaned up when it is unregistered.

### Draggable

Extends `Entity` with drag-specific properties:

```typescript
// packages/abstract/src/core/entities/draggable/draggable.ts

class Draggable<T extends Data = Data> extends Entity<T> {
  @reactive public accessor type: Type | undefined;
  @reactive public accessor modifiers: Modifiers | undefined;
  @reactive public accessor status: DraggableStatus;   // 'idle' | 'dragging' | 'dropping'

  public sensors: Sensors | undefined;
  public alignment: Alignment | undefined;

  @derived public get isDragging(): boolean;
  @derived public get isDropping(): boolean;
  @derived public get isDragSource(): boolean;
}
```

The DOM layer extends this further with `element`, `handle`, and `feedback`:

```typescript
// packages/dom/src/core/entities/draggable/draggable.ts

class Draggable<T extends Data = Data> extends AbstractDraggable<T, DragDropManager> {
  @reactive public accessor handle: Element | undefined;
  @reactive public accessor element: Element | undefined;
  @reactive public accessor feedback: FeedbackType;  // 'default' | 'move' | 'clone' | 'none'
}
```

### Droppable

Extends `Entity` with drop-target-specific properties:

```typescript
// packages/abstract/src/core/entities/droppable/droppable.ts

class Droppable<T extends Data = Data> extends Entity<T> {
  @reactive public accessor accept: Type | Type[] | ((draggable: Draggable) => boolean) | undefined;
  @reactive public accessor type: Type | undefined;
  @reactive public accessor collisionDetector: CollisionDetector;
  @reactive public accessor collisionPriority: CollisionPriority | number | undefined;
  @reactive public accessor shape: Shape | undefined;

  @derived public get isDropTarget(): boolean;

  public accepts(draggable: Draggable): boolean;
}
```

The `accept` property controls which draggables can be dropped on this droppable. It can be:
- `undefined` -- accepts all draggables
- A `Type` or `Type[]` -- accepts only draggables with matching `type`
- A function `(draggable: Draggable) => boolean` -- custom acceptance logic

### DragDropManager

The central orchestrator that ties everything together:

```typescript
// packages/abstract/src/core/manager/manager.ts

class DragDropManager<T extends Draggable, U extends Droppable> {
  public actions: DragActions<T, U, DragDropManager<T, U>>;
  public collisionObserver: CollisionObserver<T, U>;
  public dragOperation: DragOperation<T, U>;
  public monitor: DragDropMonitor<T, U, DragDropManager<T, U>>;
  public registry: DragDropRegistry<T, U, DragDropManager<T, U>>;
  public renderer: Renderer;

  get plugins(): Plugin[];
  set plugins(plugins: Plugins);
  get sensors(): Sensor[];
  set sensors(sensors: Sensors);
  get modifiers(): Modifier[];
  set modifiers(modifiers: Modifiers);

  public destroy(): void;
}
```

Configuration is passed via `DragDropManagerInput`:

```typescript
interface DragDropManagerInput<T extends DragDropManager<any, any>> {
  plugins?: Plugins<T>;
  sensors?: Sensors<T>;
  modifiers?: Modifiers<T>;
  renderer?: Renderer;
}
```

The DOM layer extends the manager with a default preset:

```typescript
// packages/dom/src/core/manager/manager.ts

const defaultPreset = {
  plugins: [Accessibility, AutoScroller, Cursor, Feedback, PreventSelection],
  sensors: [PointerSensor, KeyboardSensor],
  modifiers: [],
};

class DragDropManager extends AbstractDragDropManager {
  constructor(input: Input = {}) {
    // Merges user config with defaults, always includes ScrollListener and Scroller
    super({
      ...input,
      plugins: [ScrollListener, Scroller, ...plugins],
      sensors,
      modifiers,
    });
  }
}
```

### Sensor

Sensors detect user input and translate it into drag operations. They extend `Plugin` and must implement a `bind()` method:

```typescript
// packages/abstract/src/core/sensors/sensor.ts

abstract class Sensor<
  T extends DragDropManager<any, any> = DragDropManager<Draggable, Droppable>,
  U extends SensorOptions = SensorOptions,
> extends Plugin<T, U> {
  /**
   * Binds the sensor to a draggable source.
   * Returns a cleanup function to unbind.
   */
  public abstract bind(source: Draggable, options?: U): CleanupFunction;
}
```

The `bind()` method is called for each draggable when its effects run. It should attach event listeners and return a cleanup function that removes them.

### Plugin

The base class for all extensibility points:

```typescript
// packages/abstract/src/core/plugins/plugin.ts

abstract class Plugin<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends PluginOptions = PluginOptions,
> {
  constructor(public manager: T, public options?: U);

  @reactive public accessor disabled: boolean;

  public enable(): void;
  public disable(): void;
  public isDisabled(): boolean;       // reads without tracking (untracked)
  public configure(options?: U): void;

  protected registerEffect(callback: () => void): CleanupFunction;
  public destroy(): void;

  static configure(options: PluginOptions): PluginDescriptor;
}
```

Key methods:
- `registerEffect()` -- registers a reactive effect that is automatically cleaned up on `destroy()`
- `destroy()` -- calls all cleanup functions registered via `registerEffect()`
- `static configure()` -- creates a `{ plugin, options }` descriptor for passing to the manager

`CorePlugin` extends `Plugin` and is used for built-in plugins that should not be unregistered when the plugin list is updated.

### Modifier

Modifiers transform drag coordinates. They extend `Plugin` and override `apply()`:

```typescript
// packages/abstract/src/core/modifiers/modifier.ts

class Modifier<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends ModifierOptions = ModifierOptions,
> extends Plugin<T, U> {
  /**
   * Applies the modifier to the current drag operation.
   * Returns the transformed coordinates.
   */
  public apply(operation: DragOperationSnapshot<any, any>): Coordinates;
}
```

The `DragOperationSnapshot` passed to `apply()` includes:
- `source`, `target` -- the current draggable and droppable entities
- `transform` -- the cumulative transform from previous modifiers
- `shape` -- the drag operation's shape with history
- `position` -- the position with current/initial/previous
- `status` -- the operation status
- `canceled` -- whether the operation was canceled

### CollisionDetector

A collision detector is a pure function:

```typescript
// packages/abstract/src/core/collision/types.ts

type CollisionDetector = <
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
>(input: CollisionDetectorInput<T, U>) => Collision | null;

interface CollisionDetectorInput<T extends Draggable, U extends Droppable> {
  droppable: U;
  dragOperation: DragOperation<T, U>;
}

interface Collision {
  id: UniqueIdentifier;
  priority: CollisionPriority | number;
  type: CollisionType;
  value: number;        // higher = stronger collision
  data?: Record<string, any>;
}

enum CollisionPriority { Lowest, Low, Normal, High, Highest }
enum CollisionType { Collision, ShapeIntersection, PointerIntersection }
```

The `CollisionObserver` calls each droppable's `collisionDetector` and sorts the results by priority (descending), then by value (descending). The highest-ranked collision becomes the drop target.

---

## Reactive State Management

The `@dnd-kit/state` package is the foundation of the library's reactivity. It wraps `@preact/signals-core` with TypeScript decorators and utilities.

### Signals

Signals are the primitive reactive containers. They are re-exported directly from `@preact/signals-core`:

```typescript
import { signal, Signal, batch, effect, untracked } from '@dnd-kit/state';

const count = signal(0);
count.value;          // read (creates dependency in reactive context)
count.value = 1;      // write (triggers effects)
count.peek();         // read without tracking
```

### The `@reactive` Decorator

Applied to class accessor fields to make them reactive:

```typescript
// packages/state/src/decorators.ts

function reactive<This, Value>(
  { get }: ClassAccessorDecoratorTarget<This, Value>,
  _: ClassAccessorDecoratorContext<This, Value>
): ClassAccessorDecoratorResult<This, Value> {
  return {
    init(value: Value) {
      return signal(value) as Value;     // stores a signal internally
    },
    get(): Value {
      const current = get.call(this) as Signal<Value>;
      return current.value;              // reading creates a dependency
    },
    set(newValue: Value) {
      const current = get.call(this) as Signal<Value>;
      if (current.peek() === newValue) return;  // skip if unchanged
      current.value = newValue;
    },
  };
}
```

Usage:

```typescript
class MyEntity {
  @reactive
  public accessor disabled: boolean = false;
}
```

Under the hood, the `disabled` accessor stores a `Signal<boolean>`. Reading `entity.disabled` in a reactive context (inside an `effect` or `computed`) subscribes to changes. Writing `entity.disabled = true` notifies all subscribers.

### The `@derived` Decorator

Applied to class getters to create memoized computed values:

```typescript
// packages/state/src/decorators.ts

function derived<This, Return>(
  target: (this: This) => Return,
  _: ClassGetterDecoratorContext<This, Return>
) {
  const map: WeakMap<any, Signal<Return>> = new WeakMap();

  return function (this: This): Return {
    let result = map.get(this);
    if (!result) {
      result = computed(target.bind(this));
      map.set(this, result);
    }
    return result.value;
  };
}
```

Usage:

```typescript
class Draggable extends Entity {
  @derived
  public get isDragSource() {
    return this.manager?.dragOperation.source?.id === this.id;
  }
}
```

The computed value is lazily created per instance (using a `WeakMap`) and only recomputes when the signals it reads (`dragOperation.source`, `this.id`) change.

### The `computed()` Function

A wrapper around `@preact/signals-core`'s `computed` that adds optional custom comparator support:

```typescript
function computed<T>(
  compute: () => T,
  comparator?: (a: T, b: T) => boolean
): ReadonlySignal<T>;
```

When a `comparator` is provided, the computed signal only reports a change when the comparator returns `false`, preventing unnecessary downstream recomputation for structurally equal values.

### Effects

Effects are reactive subscriptions that re-run when their signal dependencies change:

```typescript
// Single effect
const dispose = effect(() => {
  console.log('Status:', operation.status.current);
  // Automatically re-runs when status.current changes
});

// Multiple effects with single cleanup
const cleanup = effects(
  () => { /* effect 1 */ },
  () => { /* effect 2 */ },
);
cleanup();  // disposes all
```

Effects can return a cleanup function that runs before the effect re-executes:

```typescript
effect(() => {
  const element = this.element;
  if (element) {
    element.addEventListener('click', handler);
    return () => element.removeEventListener('click', handler);
  }
});
```

### `ValueHistory<T>`

Tracks the history of a value with `current`, `initial`, and `previous`:

```typescript
class ValueHistory<T> {
  constructor(defaultValue: T, equals?: (a: T, b: T) => boolean);

  get current(): T;      // reactive
  set current(value: T);  // updates previous, sets initial on first write
  get initial(): T;       // reactive
  get previous(): T | undefined;  // reactive

  reset(value?: T): void;
}
```

Used by `Position` (extends `ValueHistory<Point>`) and `DragOperation.shape` (uses `ValueHistory<Shape>`).

### `snapshot()`

Creates a non-reactive shallow copy of an object, reading all properties inside `untracked()`:

```typescript
function snapshot<T extends object>(value: T): T {
  return untracked(() => {
    const output = {} as T;
    for (const key in value) {
      output[key] = value[key];
    }
    return output;
  });
}
```

Used when creating `DragOperationSnapshot` instances for event dispatch, ensuring event handlers receive stable values without creating reactive dependencies.

### `batch()` and `untracked()`

- `batch(() => { ... })` -- groups multiple signal writes into a single transaction. Dependent effects and computed values only re-evaluate once after the batch completes.
- `untracked(() => { ... })` -- reads signals without creating dependencies. Useful in callbacks that should not trigger re-runs of the enclosing effect.

### `WeakStore`

A two-level weak map for caching per-instance, per-key values:

```typescript
class WeakStore<WeakKey extends object, Key extends string | number | symbol, Value> {
  get(key: WeakKey | undefined, id: Key): Value | undefined;
  set(key: WeakKey | undefined, id: Key, value: Value): void;
  clear(key: WeakKey | undefined): void;
}
```

---

## Extensibility Patterns

### Writing a Custom Sensor

Sensors must extend `Sensor` and implement the `bind()` method. Here is the pattern used by `PointerSensor`:

```typescript
import { Sensor, configurator, ActivationController } from '@dnd-kit/abstract';
import { effect } from '@dnd-kit/state';
import type { CleanupFunction } from '@dnd-kit/state';
import type { DragDropManager, Draggable } from '@dnd-kit/dom';

export interface MySensorOptions {
  activationConstraints?: ActivationConstraints<PointerEvent>;
}

export class MySensor extends Sensor<DragDropManager, MySensorOptions> {
  constructor(manager: DragDropManager, options?: MySensorOptions) {
    super(manager);
  }

  public bind(source: Draggable, options = this.options): CleanupFunction {
    // Use effect() to reactively re-bind when source.element changes
    const unbind = effect(() => {
      const target = source.handle ?? source.element;
      if (!target) return;

      const listener = (event: PointerEvent) => {
        if (this.disabled || source.disabled) return;

        // Start the drag operation
        this.manager.actions.start({
          event,
          coordinates: { x: event.clientX, y: event.clientY },
          source,
        });
      };

      target.addEventListener('pointerdown', listener);
      return () => target.removeEventListener('pointerdown', listener);
    });

    return unbind;
  }

  // Static configure method for passing options
  static configure = configurator(MySensor);
}

// Usage:
const manager = new DragDropManager({
  sensors: [MySensor.configure({ activationConstraints: [...] })],
});
```

Key patterns to follow:
- Wrap listener attachment in `effect()` so that it re-runs when reactive properties (like `source.element`) change
- Always check `this.disabled` and `source.disabled`
- Check `this.manager.dragOperation.status.idle` before starting a new operation
- Return a cleanup function from `bind()` that removes all listeners
- Use the static `configurator()` helper to provide a `configure` method

### Writing a Custom Plugin

Plugins extend `Plugin` and use `registerEffect()` for reactive behavior:

```typescript
import { Plugin, configurator } from '@dnd-kit/abstract';
import type { DragDropManager } from '@dnd-kit/dom';

export interface MyPluginOptions {
  threshold?: number;
}

export class MyPlugin extends Plugin<DragDropManager, MyPluginOptions> {
  constructor(manager: DragDropManager, options?: MyPluginOptions) {
    super(manager, options);

    // Register a reactive effect
    this.registerEffect(() => {
      const { status } = manager.dragOperation;

      if (status.dragging) {
        // Do something while dragging
        console.log('Dragging!');

        return () => {
          // Cleanup when effect re-runs or plugin is destroyed
          console.log('Stopped dragging');
        };
      }
    });
  }

  static configure = configurator(MyPlugin);
}

// Usage:
const manager = new DragDropManager({
  plugins: [MyPlugin.configure({ threshold: 10 })],
});
```

Patterns:
- Use `registerEffect()` (not raw `effect()`) so cleanup happens automatically on `destroy()`
- Access `this.options` for configuration
- Use `this.manager` to access the drag operation, registry, and actions
- Implement `destroy()` if you need custom cleanup beyond what `registerEffect()` handles

### Writing a Custom Collision Algorithm

Collision detectors are pure functions -- no class needed:

```typescript
import { CollisionPriority, CollisionType } from '@dnd-kit/abstract';
import type { CollisionDetector } from '@dnd-kit/abstract';
import { Point } from '@dnd-kit/geometry';

/**
 * Custom collision detector that activates when the pointer
 * is within a certain distance of a droppable's center.
 */
export const proximityCollision: CollisionDetector = ({
  dragOperation,
  droppable,
}) => {
  const { position } = dragOperation;

  if (!droppable.shape) {
    return null;
  }

  const distance = Point.distance(droppable.shape.center, position.current);
  const threshold = 100; // pixels

  if (distance < threshold) {
    return {
      id: droppable.id,
      value: 1 / distance,   // higher value = stronger collision
      type: CollisionType.Collision,
      priority: CollisionPriority.Normal,
    };
  }

  return null;
};

// Usage on a droppable:
const droppable = new Droppable({
  id: 'my-droppable',
  collisionDetector: proximityCollision,
}, manager);
```

Patterns:
- Return `null` when there is no collision
- The `value` field determines ranking among collisions of the same priority; higher values rank first
- Use `CollisionPriority` to control precedence (e.g., `PointerIntersection` uses `High`, `ShapeIntersection` uses `Normal`)
- Access `dragOperation.position.current` for pointer coordinates, `dragOperation.shape?.current` for the drag shape
- Access `droppable.shape` for the droppable's geometry

The built-in `defaultCollisionDetection` composes `pointerIntersection` and `shapeIntersection`:

```typescript
export const defaultCollisionDetection: CollisionDetector = (args) => {
  return pointerIntersection(args) ?? shapeIntersection(args);
};
```

### Writing a Custom Modifier

Modifiers transform drag coordinates. Extend `Modifier` and override `apply()`:

```typescript
import { Modifier, configurator } from '@dnd-kit/abstract';
import type { DragDropManager } from '@dnd-kit/dom';
import type { DragOperationSnapshot } from '@dnd-kit/abstract';
import type { Coordinates } from '@dnd-kit/geometry';

export interface SnapToGridOptions {
  gridSize: number;
}

export class SnapToGrid extends Modifier<DragDropManager, SnapToGridOptions> {
  public apply(operation: DragOperationSnapshot): Coordinates {
    const { transform } = operation;
    const gridSize = this.options?.gridSize ?? 20;

    return {
      x: Math.round(transform.x / gridSize) * gridSize,
      y: Math.round(transform.y / gridSize) * gridSize,
    };
  }

  static configure = configurator(SnapToGrid);
}

// Usage:
const manager = new DragDropManager({
  modifiers: [SnapToGrid.configure({ gridSize: 25 })],
});

// Or on a specific draggable:
const draggable = new Draggable({
  id: 'my-draggable',
  modifiers: [SnapToGrid.configure({ gridSize: 25 })],
}, manager);
```

Patterns:
- The `apply()` method receives the snapshot of the current drag operation including the current `transform`
- Return the modified `Coordinates`
- Modifiers are applied in sequence; each receives the cumulative transform from preceding modifiers
- Modifiers can be set globally (on the manager) or per-draggable

### Plugin/Sensor Configuration Pattern

All configurable extensions use the same `configure` / `configurator` / `descriptor` pattern:

```typescript
// Configurator creates a static configure method
static configure = configurator(MyPlugin);

// Usage: creates a PluginDescriptor { plugin: MyPlugin, options: { ... } }
MyPlugin.configure({ option1: 'value' })

// Descriptors are normalized by the descriptor() helper
descriptor(MyPlugin)                              // { plugin: MyPlugin, options: undefined }
descriptor(MyPlugin.configure({ option1: 'a' }))  // { plugin: MyPlugin, options: { option1: 'a' } }
```

The `PluginRegistry.set values()` setter normalizes all entries to descriptors, deduplicates by constructor, and handles register/unregister transitions.

---

## Naming Conventions and Code Style

### File and Directory Structure

- **Package structure**: Each package has `src/` with an `index.ts` barrel export
- **Feature directories**: Related files are grouped in directories (`entities/draggable/`, `plugins/feedback/`, `sensors/pointer/`)
- **Barrel exports**: Each directory has an `index.ts` that re-exports public API
- **File naming**: Files are named after their primary export. Class files use PascalCase (`Draggable.ts`, `PointerSensor.ts`). Utility files use camelCase (`utilities.ts`, `types.ts`)
- **Extension**: TypeScript files use `.ts` for pure logic and `.tsx` for React components

### Type Conventions

- **Generics**: Multi-level generics follow the pattern `T` (draggable type), `U` (droppable type), `V` (manager type), `W` (additional type)
- **Input types**: Constructor input types are named `Input<T>` and defined as interfaces in the same file or nearby
- **Type unions for configuration**: Configuration parameters accept either a constructor or a descriptor: `(PluginConstructor<T> | PluginDescriptor<T>)[]`
- **Type inference helpers**: `InferPluginOptions<P>` and `InferManager<P>` extract types from plugin instances or constructors

### Class Patterns

- **Accessor decorators over manual getters/setters**: Reactive state uses `@reactive public accessor fieldName` (TC39 stage 3 decorators)
- **Derived getters**: Computed properties use `@derived public get propertyName()`
- **Private state**: True private state uses `#privateField` syntax
- **Constructor initialization**: Complex setup logic is in the constructor, with `this.destroy` being reassigned to include additional cleanup:

```typescript
constructor(manager) {
  super(manager);
  const { destroy } = this;
  const cleanup = effects(...);
  this.destroy = () => {
    cleanup();
    destroy();
  };
}
```

- **Method binding**: Methods that are passed as callbacks are bound in the constructor: `this.handleCancel = this.handleCancel.bind(this)`

### Reactive Patterns

- **`@reactive` for mutable state**: Any property that should trigger re-renders when changed
- **`@derived` for computed state**: Any property that is derived from other reactive values
- **`untracked()` for side-effect-free reads**: When reading reactive values inside effects but not wanting to create a dependency
- **`batch()` for atomic updates**: When updating multiple related signals that should not trigger intermediate recomputations
- **`effects()` for lifecycle management**: Grouping multiple effects with a single cleanup function

### Event Handling

- **Preventable events**: Events that can be canceled use the `defaultPreventable()` wrapper
- **Event naming**: Events use lowercase concatenated names: `beforedragstart`, `dragstart`, `dragmove`, `dragover`, `dragend`, `collision`
- **Handler naming**: Event handler props in React use `onEventName` format: `onDragStart`, `onDragEnd`
- **Latest ref pattern**: React event handlers are wrapped in `useLatest()` to avoid stale closures

### Cleanup Patterns

- **Cleanup function sets**: Sensors and plugins collect cleanup functions in `Set<CleanupFunction>` and call them all during teardown
- **Effect-based lifecycle**: Using `registerEffect()` ties cleanup to plugin destruction automatically
- **AbortController**: Drag operations use `AbortController` for cancellation signaling

### Import Style

- **Type-only imports**: Types are imported with `import type { ... }` to ensure they are erased at compile time
- **Relative imports with extensions**: Internal imports use explicit `.ts` extensions: `import { Entity } from './entity.ts'`
- **Package imports**: Cross-package imports use package names: `import { reactive } from '@dnd-kit/state'`

### Error Handling

- Errors are thrown for programming mistakes (e.g., starting a drag without a source, invalid registry input)
- Defensive checks use early returns rather than assertions for runtime conditions (e.g., missing elements, idle status)
- The `beforedragstart` event allows consumers to `preventDefault()` to cancel a drag before it begins
