import type {UniqueIdentifier} from '@dnd-kit/abstract';
import type {DragDropManager, Droppable} from '@dnd-kit/dom';
import {batch, untracked} from '@dnd-kit/state';
import {acquireCollisionTransaction} from '../../core/plugins/collision/transaction.ts';

interface Suspension {
  readonly controller: AbortController;
  readonly current: boolean;
  readonly finished: Promise<void>;
  include(entries: Iterable<Droppable>): void;
  run(callback: () => void): void;
  waitFor(rendering: Promise<unknown>): Promise<boolean>;
  waitForOthers(): Promise<void>;
  release(): void;
}

interface Gate {
  controller: AbortController;
  owners: Set<Suspension>;
  disconnect(): void;
}

// Both sortable plugins share this module in the sortable bundle. The public
// observer.disabled switch belongs to callers, never to these transactions.
const gates = new WeakMap<DragDropManager, Gate>();

function isCurrent(manager: DragDropManager, controller: AbortController) {
  const {dragOperation} = manager;

  return (
    dragOperation.controller === controller &&
    !controller.signal.aborted &&
    dragOperation.status.dragging &&
    !dragOperation.canceled
  );
}

export function createCollisionSuspension(manager: DragDropManager) {
  const owned = new Set<Suspension>();
  let destroyed = false;

  return {
    acquire(entries: Iterable<Droppable> = []): Suspension | undefined {
      const {controller} = manager.dragOperation;
      if (destroyed || !controller || !isCurrent(manager, controller)) return;

      let gate = gates.get(manager);

      if (gate && gate.controller !== controller) {
        for (const owner of gate.owners) owner.release();
        gate = undefined;
      }

      if (!gate) {
        const owners = new Set<Suspension>();
        const unsubscribe = manager.monitor.addEventListener(
          'collision',
          (event) => {
            if (owners.size && isCurrent(manager, controller)) {
              event.preventDefault();
            }
          }
        );
        const abort = () => {
          for (const owner of owners) owner.release();
        };

        controller.signal.addEventListener('abort', abort, {once: true});
        gate = {
          controller,
          owners,
          disconnect() {
            unsubscribe();
            controller.signal.removeEventListener('abort', abort);
          },
        };
        gates.set(manager, gate);
      }

      const currentGate = gate;
      const releaseTransaction = acquireCollisionTransaction(manager);
      const affected = new Set<UniqueIdentifier>();
      const elements = new Set<Element>();
      let released = false;
      let finish!: () => void;

      const include = (entries: Iterable<Droppable>) => {
        for (const entry of entries) {
          affected.add(entry.id);
          if (entry.element) elements.add(entry.element);
        }

        // Capture the old ancestors before reparenting, including a container
        // that loses its last child. Resolve their current instances at commit.
        if (!elements.size) return;
        const ancestors = new Set<Element>();
        for (const element of elements) {
          let ancestor: Element | null = element;
          while (ancestor && !ancestors.has(ancestor)) {
            ancestors.add(ancestor);
            ancestor = ancestor.parentElement;
          }
        }
        for (const entry of manager.registry.droppables) {
          const {element} = entry;
          if (element && ancestors.has(element)) {
            affected.add(entry.id);
          }
        }
      };

      const suspension: Suspension = {
        controller,
        get current() {
          return !destroyed && !released && isCurrent(manager, controller);
        },
        finished: new Promise<void>((resolve) => {
          finish = resolve;
        }),
        include,
        run(callback) {
          if (suspension.current) releaseTransaction.run(callback);
        },
        waitFor(rendering) {
          return rendering.then(
            () => suspension.current,
            () => false
          );
        },
        async waitForOthers() {
          await Promise.all(
            Array.from(currentGate.owners)
              .filter((owner) => owner !== suspension)
              .map((owner) => owner.finished)
          );
        },
        release() {
          if (released) return;
          released = true;

          try {
            if (affected.size && isCurrent(manager, controller)) {
              untracked(() => {
                include(
                  Array.from(manager.registry.droppables).filter((entry) =>
                    affected.has(entry.id)
                  )
                );
                batch(() => {
                  for (const id of affected) {
                    manager.registry.droppables.get(id)?.refreshShape();
                  }
                });
              });
            }
          } finally {
            owned.delete(suspension);
            currentGate.owners.delete(suspension);
            finish();

            try {
              if (!currentGate.owners.size) {
                currentGate.disconnect();
                if (gates.get(manager) === currentGate) gates.delete(manager);
                if (isCurrent(manager, controller)) {
                  manager.collisionObserver.forceUpdate();
                }
              }
            } finally {
              releaseTransaction();
            }
          }
        },
      };

      owned.add(suspension);
      currentGate.owners.add(suspension);

      try {
        untracked(() => include(entries));
      } catch (error) {
        suspension.release();
        throw error;
      }

      return suspension;
    },
    destroy() {
      destroyed = true;
      for (const suspension of owned) suspension.release();
    },
  };
}
