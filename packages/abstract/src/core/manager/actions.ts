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

export class DragActions<
  T extends Draggable,
  U extends Droppable,
  V extends DragDropManager<T, U>,
> {
  constructor(private readonly manager: V) {}

  setDragSource(source: T | UniqueIdentifier) {
    const {dragOperation} = this.manager;
    dragOperation.sourceIdentifier =
      typeof source === 'string' || typeof source === 'number'
        ? source
        : source.id;
  }

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

  start(args: {
    event?: Event;
    source?: T | UniqueIdentifier;
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

  move(args: {
    by?: Coordinates;
    to?: Coordinates;
    event?: Event;
    cancelable?: boolean;
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

  stop(args: {event?: Event; canceled?: boolean} = {}): void {
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
