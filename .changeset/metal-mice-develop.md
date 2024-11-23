---
'@dnd-kit/core': minor
---

Make it possible to add visual cues when using activation constraints.

### Context

Activation constraints are used when we want to prevent accidental dragging or when
pointer press can mean more than "start dragging".

A typical use case is a button that needs to respond to both "click" and "drag" gestures.
Clicks can be distinguished from drags based on how long the pointer was
held pressed.

### The problem

A control that responds differently to a pointer press based on duration or distance can
be confusing to use -- the user has to guess how long to keep holding or how far to keep
dragging until their intent is acknowledged.

Implementing such cues is currently possible by attaching extra event listeners so that
we know when a drag is pending. Furthermore, the listener needs to have access to
the same constraints that were applied to the sensor initiating the drag. This can be
made to work in simple cases, but it becomes error-prone and difficult to maintain in
complex scenarios.

### Solution

This changeset proposes the addition of two new events: `onDragPending` and `onDragAbort`.

#### `onDragPending`

A drag is considered to be pending when the pointer has been pressed and there are
activation constraints that need to be satisfied before a drag can start.

This event is initially fired on pointer press. At this time `offset` (see below) will be
`undefined`.

It will subsequently be fired every time the pointer is moved. This is to enable
visual cues for distance-based activation.

The event's payload contains all the information necessary for providing visual feedback:

```typescript
export interface DragPendingEvent {
  id: UniqueIdentifier;
  constraint: PointerActivationConstraint;
  initialCoordinates: Coordinates;
  offset?: Coordinates | undefined;
}
```

#### `onDragAbort`

A drag is considered aborted when an activation constraint for a pending drag was violated.
Useful as a prompt to cancel any visual cue animations currently in progress.
Note that this event will _not_ be fired when dragging ends or is canceled.
