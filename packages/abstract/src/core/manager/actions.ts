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

      dragOperation.targetIdentifier = id;

      const event = defaultPreventable({
        operation: dragOperation.snapshot(),
      });

      if (dragOperation.status.dragging) {
        this.manager.monitor.dispatch('dragover', event);
      }

      return this.manager.renderer.rendering.then(() => event.defaultPrevented);
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
  }): boolean {
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
        return false;
      }

      this.manager.renderer.rendering.then(() => {
        dragOperation.status.set(StatusValue.Initializing);

        requestAnimationFrame(() => {
          dragOperation.status.set(StatusValue.Dragging);

          this.manager.monitor.dispatch('dragstart', {
            nativeEvent,
            operation: dragOperation.snapshot(),
            cancelable: false,
          });
        });
      });

      return true;
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
      if (!dragOperation.status.dragging) {
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

      if (args.propagate ?? true) {
        this.manager.monitor.dispatch('dragmove', event);
      }

      queueMicrotask(() => {
        if (event.defaultPrevented) {
          return;
        }

        const coordinates = args.to ?? {
          x: dragOperation.position.current.x + (args.by?.x ?? 0),
          y: dragOperation.position.current.y + (args.by?.y ?? 0),
        };

        dragOperation.position.current = coordinates;
      });
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
      let promise: Promise<void> | undefined;
      const suspend = () => {
        const output = {
          resume: () => {},
          abort: () => {},
        };

        promise = new Promise<void>((resolve, reject) => {
          output.resume = resolve;
          output.abort = reject;
        });

        return output;
      };

      const end = () => {
        this.manager.renderer.rendering.then(() => {
          dragOperation.status.set(StatusValue.Dropped);

          const dropping = untracked(
            () => dragOperation.source?.status === 'dropping'
          );

          if (dropping) {
            const currentSource = dragOperation.source;

            // Wait until the source has finished dropping before resetting the operation
            const dispose = effect(() => {
              if (currentSource?.status === 'idle') {
                dispose();

                if (dragOperation.source !== currentSource) return;

                dragOperation.reset();
              }
            });
          } else {
            this.manager.renderer.rendering.then(() => dragOperation.reset());
          }
        });
      };

      batch(() => {
        dragOperation.canceled = args.canceled ?? false;
      });

      this.manager.monitor.dispatch('dragend', {
        nativeEvent: args.event,
        operation: dragOperation,
        canceled: args.canceled ?? false,
        suspend,
      });

      if (promise) {
        promise.then(end).catch(() => dragOperation.reset());
      } else {
        end();
      }
    });
  }
}
