import {Droppable as AbstractDroppable} from '@dnd-kit/abstract';
import type {
  Data,
  Draggable as AbstractDraggable,
  DroppableInput as AbstractDroppableInput,
} from '@dnd-kit/abstract';
import {defaultCollisionDetection} from '@dnd-kit/collision';
import type {CollisionDetector} from '@dnd-kit/collision';
import {reactive, signal, untracked} from '@dnd-kit/state';
import type {BoundingRectangle, Shape} from '@dnd-kit/geometry';
import {
  DOMRectangle,
  getFrameElement,
  isShadowRoot,
  PositionObserver,
  ProxiedElements,
} from '@dnd-kit/dom/utilities';

import type {DragDropManager} from '../../manager/manager.ts';
import type {Draggable} from '../draggable/draggable.ts';

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
    const updateShape = (boundingClientRect?: BoundingRectangle | null) => {
      const {manager, element} = this;

      if (!element || boundingClientRect === null) {
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

    const observePosition = signal(false);

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

            observePosition.value = Boolean(
              source &&
                dragOperation.status.initialized &&
                element &&
                !this.disabled &&
                this.accepts(source)
            );
          },
          () => {
            const {element} = this;

            if (observePosition.value && element) {
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

    this.element = element;
    this.refreshShape = () => updateShape();
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

  public override accepts(draggable: AbstractDraggable): boolean {
    if (!super.accepts(draggable)) return false;

    // Sortables can use a separate target within their own source element.
    if (this.id === draggable.id) return true;

    const source = (draggable as Draggable).element;

    if (!source) return true;

    const placeholder = ProxiedElements.get(source);

    // Feedback may move the source and proxy its droppables to a placeholder.
    // Check both trees, including the original target hidden by its proxy.
    return ![source, placeholder].some(
      (root) =>
        root &&
        (isStrictDescendant(root, this.#element) ||
          isStrictDescendant(root, this.proxy))
    );
  }

  public refreshShape: () => Shape | undefined;
}

function isStrictDescendant(root: Element, element: Element | undefined) {
  if (!element || element === root) return false;

  let current: Element | undefined = element;

  while (current) {
    if (root.contains(current)) return true;

    const treeRoot = current.getRootNode();

    // Native contains() stops at shadow and document boundaries. Only cross
    // a frame boundary for connected nodes, not detached nodes it once owned.
    current = isShadowRoot(treeRoot)
      ? treeRoot.host
      : treeRoot === current.ownerDocument
        ? (getFrameElement(current) ?? undefined)
        : undefined;
  }

  return false;
}
