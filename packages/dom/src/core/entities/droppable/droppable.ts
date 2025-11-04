import {Droppable as AbstractDroppable} from '@dnd-kit/abstract';
import type {
  Data,
  DroppableInput as AbstractDroppableInput,
} from '@dnd-kit/abstract';
import {defaultCollisionDetection} from '@dnd-kit/collision';
import type {CollisionDetector} from '@dnd-kit/collision';
import {reactive, signal, untracked} from '@dnd-kit/state';
import type {Shape} from '@dnd-kit/geometry';
import {DOMRectangle, observePosition, throttle} from '@dnd-kit/dom/utilities';

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
    const updateShape = (visible: boolean) => {
      const {manager, element} = this;

      if (!element || !visible) {
        this.shape = undefined;
        return undefined;
      }

      if (!manager) return;

      const updatedShape = new DOMRectangle(element);
      const shape = untracked(() => this.shape);

      if (updatedShape && shape?.equals(updatedShape)) {
        return shape;
      }

      this.shape = updatedShape;

      return updatedShape;
    };

    const shouldObservePosition = signal(false);

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

            shouldObservePosition.value = Boolean(
              source &&
                dragOperation.status.initialized &&
                element &&
                !this.disabled &&
                this.accepts(source)
            );
          },
          () => {
            const {element} = this;

            if (shouldObservePosition.value && element) {
              updateShape(true);
              const unobserve = observePosition(element, () =>
                updateShape(true)
              );

              return () => {
                unobserve();
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

    this.element = element;
    this.refreshShape = () => updateShape(true);
  }

  @reactive
  accessor #element: Element | undefined;

  @reactive
  public accessor proxy: Element | undefined;

  set element(element: Element | undefined) {
    this.#element = element;
  }

  get element() {
    return this.proxy ?? this.#element;
  }

  public refreshShape: () => Shape | undefined;
}
