import {Droppable as AbstractDroppable} from '@dnd-kit/abstract';
import type {
  Data,
  DroppableInput as AbstractDroppableInput,
} from '@dnd-kit/abstract';
import {defaultCollisionDetection} from '@dnd-kit/collision';
import type {CollisionDetector} from '@dnd-kit/collision';
import {Signal, reactive, signal, untracked} from '@dnd-kit/state';
import type {Shape} from '@dnd-kit/geometry';
import {
  DOMRectangle,
  getDocument,
  scheduler,
  getFirstScrollableAncestor,
} from '@dnd-kit/dom/utilities';

import type {DragDropManager} from '../../manager/manager.ts';

type OptionalInput = 'collisionDetector';

export interface Input<T extends Data = Data>
  extends Omit<AbstractDroppableInput<T>, OptionalInput> {
  collisionDetector?: CollisionDetector;
  element?: Element;
}

export class Droppable<T extends Data = Data> extends AbstractDroppable<T> {
  constructor(
    {element, effects = () => [], ...input}: Input<T>,
    manager: DragDropManager | undefined
  ) {
    const {collisionDetector = defaultCollisionDetection} = input;

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

            if (element && dragOperation.status.initialized) {
              const scrollableAncestor = getFirstScrollableAncestor(element);
              const doc = getDocument(element);
              const root =
                scrollableAncestor === doc.scrollingElement
                  ? doc
                  : scrollableAncestor;
              const intersectionObserver = new IntersectionObserver(
                (entries) => {
                  const [entry] = entries.slice(-1);
                  const {width, height} = entry.boundingClientRect;

                  if (!width && !height) {
                    return;
                  }

                  this.visible = entry.isIntersecting;
                },
                {
                  root: root ?? doc,
                  rootMargin: '40%',
                }
              );

              const mutationObserver = new MutationObserver(() =>
                scheduler.schedule(this.refreshShape)
              );

              const resizeObserver = new ResizeObserver(() =>
                scheduler.schedule(this.refreshShape)
              );

              if (element.parentElement) {
                mutationObserver.observe(element.parentElement, {
                  childList: true,
                });
              }

              resizeObserver.observe(element);
              intersectionObserver.observe(element);

              return () => {
                this.shape = undefined;
                this.visible = undefined;
                resizeObserver.disconnect();
                mutationObserver.disconnect();
                intersectionObserver.disconnect();
              };
            }
          },
          () => {
            const {manager} = this;

            if (!manager) return;

            const {dragOperation} = manager;
            const {status} = dragOperation;
            const source = untracked(() => dragOperation.source);

            if (status.initialized) {
              if (source?.type != null && !this.accepts(source)) {
                return;
              }

              scheduler.schedule(this.refreshShape);
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

    this.internal = {
      element: signal(element),
    };
    this.refreshShape = this.refreshShape.bind(this);

    /*
     * If a droppable target mounts during a drag operation, assume it is visible
     * so that we can update its shape immediately.
     */
    if (this.manager?.dragOperation.status.initialized) {
      this.visible = true;
    }
  }

  @reactive
  public accessor visible: Boolean | undefined;

  @reactive
  public accessor placeholder: Element | undefined;

  public set element(value: Element | undefined) {
    this.internal.element.value = value;
  }

  public get element() {
    return this.placeholder ?? this.internal?.element.value;
  }

  public refreshShape(ignoreTransform?: boolean): Shape | undefined {
    const {element, shape} = this;

    if (!element || this.visible === false) {
      this.shape = undefined;
      return undefined;
    }

    const updatedShape = new DOMRectangle(element, ignoreTransform);

    if (updatedShape && shape?.equals(updatedShape)) {
      return shape;
    }

    this.shape = updatedShape;

    return updatedShape;
  }

  internal: {
    element: Signal<Element | undefined>;
  };
}
