import {Droppable as AbstractDroppable} from '@dnd-kit/abstract';
import type {
  Data,
  DroppableInput as AbstractDroppableInput,
  DragDropManager as AbstractDragDropManager,
} from '@dnd-kit/abstract';
import {defaultCollisionDetection} from '@dnd-kit/collision';
import type {CollisionDetector} from '@dnd-kit/collision';
import {effects, reactive, signal} from '@dnd-kit/state';
import type {Shape} from '@dnd-kit/geometry';
import {
  DOMRectangle,
  getOwnerDocument,
  scheduler,
} from '@dnd-kit/dom-utilities';

type OptionalInput = 'collisionDetector';

export interface Input<T extends Data = Data>
  extends Omit<AbstractDroppableInput<T>, OptionalInput> {
  collisionDetector?: CollisionDetector;
  element?: Element;
}

export class Droppable<T extends Data = Data> extends AbstractDroppable<T> {
  constructor(
    {
      collisionDetector = defaultCollisionDetection,
      element,
      ...input
    }: Input<T>,
    public manager: AbstractDragDropManager<any, any>
  ) {
    super({...input, collisionDetector}, manager);

    const {destroy} = this;

    this.refreshShape = this.refreshShape.bind(this);

    /*
     * If a droppable target mounts during a drag operation, assume it is visible
     * so that we can update its shape immediately.
     */
    if (manager.dragOperation.status.initialized) {
      this.visible = true;
    }

    const cleanup = effects(
      () => {
        const {element} = this;
        const {dragOperation} = manager;

        if (element && dragOperation.status.initialized) {
          let timeout: NodeJS.Timeout | undefined;

          const intersectionObserver = new IntersectionObserver(
            (entries) => {
              const [entry] = entries.slice(-1);

              if (this.visible == null) {
                this.visible = entry.isIntersecting;
                return;
              }

              if (timeout) {
                clearTimeout(timeout);
              }

              timeout = setTimeout(() => {
                this.visible = entry.isIntersecting;
                timeout = undefined;
              }, 50);
            },
            {
              root: getOwnerDocument(element),
              rootMargin: '40%',
            }
          );

          intersectionObserver.observe(element);

          return () => {
            this.visible = undefined;
            intersectionObserver.disconnect();
          };
        }
      },
      () => {
        if (manager.dragOperation.status.dragging) {
          scheduler.schedule(this.refreshShape);
        }
      }
    );

    this.destroy = () => {
      cleanup();
      destroy();
    };
  }

  @reactive
  visible: Boolean | undefined;

  #element = signal<Element | undefined>(undefined);

  @reactive
  public placeholder: Element | undefined;

  public set element(value: Element | undefined) {
    this.#element.value = value;
  }

  public get element() {
    return this.placeholder ?? this.#element.value;
  }

  public refreshShape(ignoreTransform?: boolean): Shape | undefined {
    const {element} = this;

    if (!element || this.disabled || this.visible === false) {
      this.shape = undefined;
      return undefined;
    }

    const {shape} = this;
    const updatedShape = new DOMRectangle(element, ignoreTransform);

    if (updatedShape && shape?.equals(updatedShape)) {
      return shape;
    }

    this.shape = updatedShape;

    return updatedShape;
  }
}
