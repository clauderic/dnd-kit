import type {Coordinates} from '@dnd-kit/geometry';
import {batch, effect, untracked} from '@dnd-kit/state';

import type {
  Draggable,
  Droppable,
  UniqueIdentifier,
} from '../entities/index.ts';

import type {DragDropManager} from './manager.ts';
import {defaultPreventable} from './events.ts';
import {StatusValue} from './status.ts';
import {collisionState} from '../collision/state.ts';
import {
  actionState,
  dispatchWithCompletion,
  finishAction,
} from './completion.ts';

/**
 * Provides actions for controlling drag and drop operations.
 *
 * @template T - The type of draggable entities
 * @template U - The type of droppable entities
 * @template V - The type of drag and drop manager
 */
export class DragActions<
  T extends Draggable,
  U extends Droppable,
  V extends DragDropManager<T, U>,
> {
  /**
   * Creates a new instance of drag actions.
   *
   * @param manager - The drag and drop manager instance
   */
  constructor(private readonly manager: V) {}

  #stopping?: {controller: AbortController; cancel: () => void};

  /**
   * Sets the source of the drag operation.
   *
   * @param source - The draggable entity or its unique identifier
   */
  setDragSource(source: T | UniqueIdentifier) {
    const {dragOperation} = this.manager;
    dragOperation.sourceIdentifier =
      typeof source === 'string' || typeof source === 'number'
        ? source
        : source.id;
  }

  /**
   * Sets the target of the drop operation.
   *
   * @param identifier - The unique identifier of the droppable entity or null/undefined
   * @returns A promise that resolves to true if the drop was prevented
   */
  setDropTarget(
    identifier: UniqueIdentifier | null | undefined
  ): Promise<boolean> {
    return untracked(() => {
      const {dragOperation} = this.manager;
      const id = identifier ?? null;

      if (dragOperation.targetIdentifier === id) {
        return Promise.resolve(false);
      }

      const state = collisionState(this.manager);
      const receipt = state.applied;
      const consumesCollision =
        receipt?.target === id && receipt.acknowledgment == null;
      const release = actionState(this.manager).begin();
      state.serial++;
      if (
        id != null &&
        id === dragOperation.sourceIdentifier &&
        state.applied &&
        state.applied.source === id &&
        state.applied.target !== id
      ) {
        state.applied.acknowledgment = id;
      }

      try {
        dragOperation.targetIdentifier = id;

        const event = defaultPreventable({
          operation: dragOperation.snapshot(),
        });

        const work = dragOperation.status.dragging
          ? dispatchWithCompletion(event, () =>
              this.manager.monitor.dispatch('dragover', event)
            )
          : undefined;
        const completion = work
          ? finishAction(work, () => this.manager.renderer.rendering)
          : this.manager.renderer.rendering;

        return completion
          .then(() => event.defaultPrevented)
          .finally(() => {
            // A placement consumes the collision result produced by its own
            // layout as well as the result that requested it. Record that result
            // before reopening notification, but never consume newer input.
            try {
              if (
                consumesCollision &&
                receipt &&
                state.applied === receipt &&
                state.input === receipt.input &&
                dragOperation.sourceIdentifier === receipt.source
              ) {
                const {collisionObserver} = this.manager;
                if (state.dirty) collisionObserver.forceUpdate();
                receipt.target = collisionObserver.collisions[0]?.id ?? null;
                receipt.acknowledgment =
                  dragOperation.targetIdentifier ?? undefined;
              }
            } finally {
              release();
            }
          });
      } catch (error) {
        release();
        throw error;
      }
    });
  }

  /**
   * Starts a new drag operation.
   *
   * @param args - Configuration for the drag operation
   * @param args.event - The event that initiated the drag
   * @param args.source - The source draggable entity or its identifier
   * @param args.coordinates - The initial coordinates of the drag
   * @returns true if the drag operation started successfully
   * @throws {Error} If there is no drag source or another operation is active
   */
  start(args: {
    /** The event that initiated the drag. */
    event?: Event;
    /** The source draggable entity or its identifier. */
    source?: T | UniqueIdentifier;
    /** The initial coordinates of the drag. */
    coordinates: Coordinates;
  }): AbortController {
    return untracked(() => {
      const {dragOperation} = this.manager;

      if (args.source != null) {
        this.setDragSource(args.source);
      }

      const sourceInstance = dragOperation.source;

      if (!sourceInstance) {
        throw new Error('Cannot start a drag operation without a drag source');
      }

      if (!dragOperation.status.idle) {
        throw new Error(
          'Cannot start a drag operation while another is active'
        );
      }

      const controller = new AbortController();
      collisionState(this.manager).reset();
      actionState(this.manager).reset();

      const {event: nativeEvent, coordinates} = args;

      batch(() => {
        dragOperation.status.set(StatusValue.InitializationPending);
        dragOperation.shape = null;
        dragOperation.canceled = false;
        dragOperation.activatorEvent = nativeEvent ?? null;
        dragOperation.position.reset(coordinates);
      });

      const beforeStartEvent = defaultPreventable({
        operation: dragOperation.snapshot(),
      });

      this.manager.monitor.dispatch('beforedragstart', beforeStartEvent);

      if (beforeStartEvent.defaultPrevented) {
        dragOperation.reset();
        controller.abort();
        return controller;
      }

      dragOperation.status.set(StatusValue.Initializing);
      dragOperation.controller = controller;

      this.manager.renderer.rendering.then(() => {
        if (controller.signal.aborted) return;

        const {status} = dragOperation;
        if (status.current !== StatusValue.Initializing) return;

        batch(() => {
          dragOperation.status.set(StatusValue.Dragging);

          this.manager.monitor.dispatch('dragstart', {
            nativeEvent,
            operation: dragOperation.snapshot(),
            cancelable: false,
          });
        });
      });

      return controller;
    });
  }

  /**
   * Moves the dragged entity to a new position.
   *
   * @param args - Configuration for the move operation
   * @param args.by - Relative coordinates to move by
   * @param args.to - Absolute coordinates to move to
   * @param args.event - The event that triggered the move
   * @param args.cancelable - Whether the move can be canceled
   * @param args.propagate - Whether to dispatch dragmove events
   */
  move(args: {
    /** The relative coordinates to move by. */
    by?: Coordinates;
    /** The absolute coordinates to move to. */
    to?: Coordinates;
    /** The event that triggered the move. */
    event?: Event;
    /** Whether the move can be canceled. */
    cancelable?: boolean;
    /** Whether to propagate the dragmove event to the manager. */
    propagate?: boolean;
  }): void {
    return untracked(() => {
      const {dragOperation} = this.manager;
      const {status, controller} = dragOperation;

      if (
        !status.dragging ||
        !controller ||
        controller.signal.aborted ||
        this.#stopping?.controller === controller
      ) {
        return;
      }

      const sourceId = dragOperation.sourceIdentifier;
      // Relative commands depend on the previous command's committed position.
      // Absolute pointer input stays independent and immediately observable.
      actionState(this.manager).input((release) => {
        if (
          controller.signal.aborted ||
          dragOperation.controller !== controller ||
          dragOperation.sourceIdentifier !== sourceId ||
          !status.dragging
        ) {
          release();
          return;
        }
        const event = defaultPreventable(
          {
            nativeEvent: args.event,
            operation: dragOperation.snapshot(),
            by: args.by,
            to: args.to,
          },
          args.cancelable ?? true
        );

        let failure: {error: unknown} | undefined;
        const work =
          (args.propagate ?? true)
            ? dispatchWithCompletion(
                event,
                () => this.manager.monitor.dispatch('dragmove', event),
                (error) => {
                  failure = {error};
                }
              )
            : undefined;

        let applied = false;
        let settled = !work;
        const complete = () => {
          if (applied && settled) release();
        };
        if (work) {
          const finish = () => {
            settled = true;
            complete();
          };
          work.then(finish, finish);
        }

        const apply = () => {
          try {
            if (
              failure ||
              event.defaultPrevented ||
              controller.signal.aborted ||
              dragOperation.controller !== controller
            ) {
              return;
            }

            const coordinates = args.to ?? {
              x: dragOperation.position.current.x + (args.by?.x ?? 0),
              y: dragOperation.position.current.y + (args.by?.y ?? 0),
            };

            dragOperation.position.current = coordinates;
          } finally {
            applied = true;
            complete();
          }
        };
        // Input remains live while returned work is pending. A handler that
        // consumes movement must prevent its default before this queued write.
        queueMicrotask(apply);
        // Preserve synchronous listener errors while retaining any work started
        // by earlier listeners until it settles.
        if (failure) throw failure.error;
      }, args.to == null);
    });
  }

  /**
   * Stops the current drag operation.
   *
   * @param args - Configuration for stopping the operation
   * @param args.event - The event that triggered the stop
   * @param args.canceled - Whether the operation was canceled
   * @remarks
   * This method:
   * - Dispatches a dragend event
   * - Allows suspension of the operation
   * - Handles cleanup of the operation state
   */
  stop(
    args: {
      /**
       * The event that triggered the stop.
       */
      event?: Event;
      /**
       * Whether the operation was canceled.
       *
       * @default false
       */
      canceled?: boolean;
    } = {}
  ): void {
    return untracked(() => {
      const {dragOperation} = this.manager;
      const {controller} = dragOperation;

      if (!controller || controller.signal.aborted) return;

      if (this.#stopping?.controller === controller) {
        if (args.canceled) this.#stopping.cancel();
        return;
      }

      const state = collisionState(this.manager);
      let canceled = args.canceled ?? false;
      let finished = false;
      let dispose: (() => void) | undefined;

      const finish = () => {
        if (finished) return;
        finished = true;
        dispose?.();
        this.#stopping = undefined;
        controller.abort();
        actionState(this.manager).reset();

        let promise: Promise<void> | undefined;
        const suspend = () => {
          const output = {resume: () => {}, abort: () => {}};
          promise = new Promise<void>((resolve, reject) => {
            output.resume = resolve;
            output.abort = reject;
          });
          return output;
        };

        const cleanup = () => {
          // A renderer or drop animation from an old operation cannot reset a
          // newly started operation.
          if (dragOperation.controller !== controller) return;
          dragOperation.controller = undefined;
          state.reset();
          dragOperation.reset();
        };

        const end = () => {
          this.manager.renderer.rendering.then(() => {
            if (dragOperation.controller !== controller) return;
            dragOperation.status.set(StatusValue.Dropped);
            const source = dragOperation.source;

            if (source?.status === 'dropping') {
              const dispose = effect(() => {
                if (source.status === 'idle') {
                  dispose();
                  cleanup();
                }
              });
            } else {
              this.manager.renderer.rendering.then(cleanup, cleanup);
            }
          }, cleanup);
        };

        dragOperation.canceled = canceled;
        this.manager.monitor.dispatch('dragend', {
          nativeEvent: args.event,
          operation: dragOperation.snapshot(),
          canceled,
          suspend,
        });

        if (promise) promise.then(end, cleanup);
        else end();
      };

      this.#stopping = {
        controller,
        cancel: () => {
          canceled = true;
          finish();
        },
      };

      const reconcile = () => {
        if (finished || dragOperation.controller !== controller) return;
        dispose?.();
        dispose = undefined;

        const waitForPending = () => {
          dispose = effect(() => {
            if (!actionState(this.manager).pending.value)
              queueMicrotask(reconcile);
          });
        };
        // Accepted input and target handlers finish before the terminal snapshot.
        if (actionState(this.manager).pending.value) {
          waitForPending();
          return;
        }

        if (state.dirty) this.manager.collisionObserver.forceUpdate();
        state.flush?.();
        if (finished) return; // A collision listener may have canceled the drag.

        if (actionState(this.manager).pending.value) {
          // Wait only for work already owned by the renderer, never a timer or
          // a distance threshold. A newer target may need its own commit.
          waitForPending();
        } else {
          finish();
        }
      };

      if (canceled) finish();
      else reconcile();
    });
  }
}
