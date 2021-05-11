# Mouse

The Mouse sensor responds to [Mouse events](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent). Mouse events represent events that occur due to the user interacting with a pointing device \(such as a mouse\).

### Activator

The mouse activator is the `onMouseDown` event handler. The Mouse sensor is initialized if the mouse down event was triggered by the left mouse button.

### Activation constraints

Like the [Pointer](pointer) sensor, the Mouse sensor has two activation constraints:

- Distance constraint
- Delay constraint

These activation constraints are mutually exclusive and may not be used simultaneously.

#### Distance

The distance constraint subscribes to the following interface:

```typescript
interface DistanceConstraint {
  distance: number;
}
```

The `distance` property represents the distance, in _pixels_, by which the mouse needs to be moved before a drag start event is emitted.

#### Delay

The delay constraint subscribe to the following interface:

```typescript
interface DelayConstraint {
  delay: number;
  tolerance: number;
}
```

The `delay` property represents the duration, in _milliseconds_, that a draggable item needs to be held by the mouse for before a drag start event is emitted.

The `tolerance` property represents the distance, in _pixels_, of motion that is tolerated before the drag operation is aborted. If the mouse is moved during the delay duration and the tolerance is set to zero, the drag operation will be immediately aborted. If a higher tolerance is set, for example, a tolerance of `5` pixels, the operation will only be aborted if the mouse is moved by more than 5 pixels during the delay.
