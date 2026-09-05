import {effect, untracked} from '@dnd-kit/state';

import {Entity} from '../entities/index.ts';
import {DragDropManager} from '../manager/index.ts';
import {CorePlugin} from '../plugins/index.ts';
import {defaultPreventable} from '../manager/events.ts';

import type {Collision} from './types.ts';
import {collisionState} from './state.ts';

export class CollisionNotifier extends CorePlugin {
  constructor(manager: DragDropManager<any, any>) {
    super(manager);

    const state = collisionState(manager);
    let previousCollisions: Collision[] | undefined;
    let scheduled = false;
    let destroyed = false;

    const reconcile = () =>
      untracked(() => {
        scheduled = false;
        const {collisionObserver, dragOperation, monitor} = manager;
        if (
          destroyed ||
          !dragOperation.status.dragging ||
          dragOperation.controller?.signal.aborted ||
          collisionObserver.disabled ||
          state.pending.value ||
          Entity.pendingIdChanges
        )
          return;

        if (state.dirty) collisionObserver.forceUpdate();
        const {collisions} = collisionObserver;
        if (collisions === previousCollisions) return;
        previousCollisions = collisions;

        const {generation, serial, input} = state;
        const event = defaultPreventable({collisions});
        monitor.dispatch('collision', event);

        // A listener may cancel, retarget, disable or invalidate the operation.
        if (collisionObserver.disabled) previousCollisions = undefined;
        if (
          event.defaultPrevented ||
          destroyed ||
          state.generation !== generation ||
          state.serial !== serial ||
          state.dirty ||
          collisionObserver.disabled ||
          !dragOperation.status.dragging ||
          dragOperation.controller?.signal.aborted
        )
          return;

        const id = collisions[0]?.id ?? null;
        const targetId = dragOperation.targetIdentifier;
        const {applied} = state;
        if (id === targetId) {
          // An unsuspended pass can confirm the same placement for newer input.
          // Do not erase the sorting receipt when its self-target is measured.
          if (applied?.acknowledgment !== id || applied.input !== input) {
            state.applied = {
              input,
              source: dragOperation.sourceIdentifier,
              target: id,
            };
          }
          return;
        }

        const target = dragOperation.target;
        // Sorting's source retarget acknowledges the placement we already applied.
        // Measurement/forced publication may repeat it; a new input (including a
        // tiny reversal) or a different candidate is a new decision.
        if (
          applied?.input === input &&
          applied.target === id &&
          applied.acknowledgment === targetId &&
          target &&
          !target.disabled &&
          dragOperation.source &&
          target.accepts(dragOperation.source)
        )
          return;

        state.applied = {
          input,
          source: dragOperation.sourceIdentifier,
          target: id,
        };
        // setDropTarget owns its render transaction. It cannot resume a public
        // suspension or a different plugin's pending work on completion.
        manager.actions.setDropTarget(id).catch(() => {
          // The action releases its transaction on renderer failure as well.
        });
      });

    const schedule = () => {
      if (scheduled || destroyed) return;
      scheduled = true;
      queueMicrotask(reconcile);
    };

    state.flush = reconcile;
    const dispose = effect(() => {
      void manager.collisionObserver.collisions;
      void manager.collisionObserver.disabled;
      void manager.dragOperation.status.dragging;
      void state.pending.value;
      schedule();
    });

    this.destroy = () => {
      destroyed = true;
      dispose();
      if (state.flush === reconcile) state.flush = undefined;
    };
  }
}
