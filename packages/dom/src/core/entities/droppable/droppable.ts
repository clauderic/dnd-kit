import {Droppable as AbstractDroppable} from '@dnd-kit/abstract';
import type {
  Data,
  DroppableInput as AbstractDroppableInput,
} from '@dnd-kit/abstract';
import {defaultCollisionDetection} from '@dnd-kit/collision';
import type {CollisionDetector} from '@dnd-kit/collision';
import {reactive, untracked} from '@dnd-kit/state';
import type {Shape} from '@dnd-kit/geometry';
import {DOMRectangle, PositionObserver} from '@dnd-kit/dom/utilities';

import type {DragDropManager} from '../../manager/manager.ts';

type OptionalInput = 'collisionDetector';

export interface Input<T extends Data = Data>
  extends Omit<AbstractDroppableInput<T>, OptionalInput> {
  collisionDetector?: CollisionDetector;
  element?: Element;
}

export class Droppable<T extends Data = Data> extends AbstractDroppable<
  T,
  DragDropManager
> {
  constructor(
    {element, effects = () => [], ...input}: Input<T>,
    manager: DragDropManager | undefined
  ) {
    const {collisionDetector = defaultCollisionDetection} = input;
    const updateShape = (boundingClientRect?: DOMRectReadOnly | null) => {
      const {element} = this;

      if (!element || boundingClientRect === null) {
        this.shape = undefined;
        return undefined;
      }

      const updatedShape = new DOMRectangle(element);

      const shape = untracked(() => this.shape);
      if (updatedShape && shape?.equals(updatedShape)) {
        return shape;
      }

      this.shape = updatedShape;

      return updatedShape;
    };

    super(
      {
        ...input,
        collisionDetector,
        effects: () => [
          ...effects(),
          () => {
            const {element, manager} = this;
            if (!manager) return;

            const {dragOperation} = manager;
            const {source} = dragOperation;
            const observePosition =
              source &&
              dragOperation.status.initialized &&
              element &&
              this.accepts(source);

            if (observePosition) {
              const positionObserver = new PositionObserver(
                element,
                updateShape
              );

              return () => {
                positionObserver.disconnect();
                this.shape = undefined;
              };
            }
          },
          () => {
            if (this.manager?.dragOperation.status.initialized) {
              return () => {
                this.shape = undefined;
              };
            }
          },
        ],
      },
      manager
    );

    this.refreshShape = () => updateShape();
  }

  @reactive
  public accessor element: Element | undefined;

  public refreshShape: () => Shape | undefined;
}
