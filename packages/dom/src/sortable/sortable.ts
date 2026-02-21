import {batch, reactive, untracked, WeakStore} from '@dnd-kit/state';
import type {CollisionPriority, Modifiers} from '@dnd-kit/abstract';
import type {
  Data,
  PluginConstructor,
  Type,
  UniqueIdentifier,
} from '@dnd-kit/abstract';
import {
  defaultCollisionDetection,
  type CollisionDetector,
} from '@dnd-kit/collision';
import type {Alignment} from '@dnd-kit/geometry';
import {Draggable, Droppable} from '@dnd-kit/dom';
import type {
  DraggableInput,
  FeedbackType,
  DroppableInput,
  Sensors,
  DragDropManager,
} from '@dnd-kit/dom';
import {
  animateTransform,
  getComputedStyles,
  getWindow,
  computeTranslate,
  prefersReducedMotion,
  ProxiedElements,
} from '@dnd-kit/dom/utilities';

import {SortableKeyboardPlugin} from './plugins/SortableKeyboardPlugin.ts';
import {OptimisticSortingPlugin} from './plugins/OptimisticSortingPlugin.ts';

export interface SortableTransition {
  /**
   * The duration of the transition in milliseconds.
   * @default 300
   */
  duration?: number;
  /**
   * The easing function to use for the transition.
   * @default 'cubic-bezier(0.25, 1, 0.5, 1)'
   */
  easing?: string;
  /**
   * Whether the sortable item should transition when its index changes,
   * but there is no drag operation in progress.
   * @default false
   **/
  idle?: boolean;
}

const defaultPlugins: PluginConstructor[] = [
  SortableKeyboardPlugin,
  OptimisticSortingPlugin,
];

export interface SortableInput<T extends Data>
  extends DraggableInput<T>,
    DroppableInput<T> {
  /**
   * The index of the sortable item within its group.
   */
  index: number;

  /**
   * The element that should be used as the droppable target for this sortable item.
   */
  target?: Element;

  /**
   * The optional unique identifier of the group that the sortable item belongs to.
   */
  group?: UniqueIdentifier;
  /**
   * The transition configuration to use when the index of the sortable item changes.
   */
  transition?: SortableTransition | null;
  /**
   * Plugins to register when sortable item is instantiated.
   * @default [SortableKeyboardPlugin, OptimisticSortingPlugin]
   */
  plugins?: PluginConstructor[];
}

export const defaultSortableTransition: SortableTransition = {
  duration: 250,
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
  idle: false,
};

interface TemporaryState {
  initialIndex: number;
  initialGroup: UniqueIdentifier | undefined;
}

const store = new WeakStore<
  DragDropManager,
  UniqueIdentifier,
  TemporaryState
>();

export class Sortable<T extends Data = Data> {
  public draggable: Draggable<T>;
  public droppable: Droppable<T>;

  @reactive
  public accessor index: number;

  #previousGroup: UniqueIdentifier | undefined;

  #previousIndex: number;

  get initialIndex() {
    return store.get(this.manager, this.id)?.initialIndex ?? this.index;
  }

  get initialGroup() {
    return store.get(this.manager, this.id)?.initialGroup ?? this.group;
  }

  @reactive
  public accessor group: UniqueIdentifier | undefined;

  transition: SortableTransition | null;

  constructor(
    {
      effects: inputEffects = () => [],
      group,
      index,
      sensors,
      type,
      transition = defaultSortableTransition,
      plugins = defaultPlugins,
      ...input
    }: SortableInput<T>,
    manager: DragDropManager<any, any> | undefined
  ) {
    this.droppable = new SortableDroppable<T>(input, manager, this);
    this.draggable = new SortableDraggable<T>(
      {
        ...input,
        effects: () => [
          () => {
            const status = this.manager?.dragOperation.status;

            if (
              status?.initializing &&
              this.id === this.manager?.dragOperation.source?.id
            ) {
              store.clear(this.manager);
            }

            if (status?.dragging) {
              store.set(
                this.manager,
                this.id,
                untracked(() => ({
                  initialIndex: this.index,
                  initialGroup: this.group,
                }))
              );
            }
          },
          () => {
            const {index, group, manager: _} = this;
            const previousIndex = this.#previousIndex;
            const previousGroup = this.#previousGroup;

            // Re-run this effect whenever the index changes
            if (index !== previousIndex || group !== previousGroup) {
              this.#previousIndex = index;
              this.#previousGroup = group;

              this.animate();
            }
          },
          () => {
            const {target} = this;
            const {feedback, isDragSource} = this.draggable;

            if (feedback == 'move' && isDragSource) {
              this.droppable.disabled = !target;
            }
          },
          () => {
            const {manager} = this;

            for (const plugin of plugins) {
              manager?.registry.register(plugin);
            }
          },
          ...inputEffects(),
        ],
        type,
        sensors,
      },
      manager,
      this
    );

    this.#element = input.element;
    this.manager = manager;
    this.index = index;
    this.#previousIndex = index;
    this.group = group;
    this.#previousGroup = group;
    this.type = type;
    this.transition = transition;
  }

  protected animate() {
    untracked(() => {
      const {manager, transition} = this;
      const {shape} = this.droppable;

      if (!manager) return;

      const {idle} = manager.dragOperation.status;

      if (!shape || !transition || (idle && !transition.idle)) {
        return;
      }

      manager.renderer.rendering.then(() => {
        const {element} = this;

        if (!element) {
          return;
        }

        // Cancel CSS transitions on transform-related properties before measuring.
        // These transitions (e.g. `transition: transform` from user CSS) would cause
        // getBoundingClientRect() to return the mid-transition position rather than
        // the element's final resting position, resulting in an incorrect delta.
        for (const animation of element.getAnimations()) {
          if (
            'transitionProperty' in animation &&
            (animation.transitionProperty === 'transform' ||
              animation.transitionProperty === 'translate' ||
              animation.transitionProperty === 'scale')
          ) {
            animation.cancel();
          }
        }

        const updatedShape = this.refreshShape();

        if (!updatedShape) {
          return;
        }

        const delta = {
          x: shape.boundingRectangle.left - updatedShape.boundingRectangle.left,
          y: shape.boundingRectangle.top - updatedShape.boundingRectangle.top,
        };

        const {translate} = getComputedStyles(element);
        const currentTranslate = computeTranslate(element, translate, false);
        const finalTranslate = computeTranslate(element, translate);

        if (delta.x || delta.y) {
          const resolvedTransition = prefersReducedMotion(getWindow(element))
            ? {...transition, duration: 0}
            : transition;

          animateTransform({
            element,
            keyframes: {
              translate: [
                `${currentTranslate.x + delta.x}px ${currentTranslate.y + delta.y}px ${currentTranslate.z}`,
                `${finalTranslate.x}px ${finalTranslate.y}px ${finalTranslate.z}`,
              ],
            },
            options: resolvedTransition,
          }).then(() => {
            if (!manager.dragOperation.status.dragging) {
              this.droppable.shape = undefined;
            }
          });
        }
      });
    });
  }

  public get manager(): DragDropManager<any, any> | undefined {
    return this.draggable.manager as any;
  }

  public set manager(manager: DragDropManager<any, any> | undefined) {
    batch(() => {
      this.draggable.manager = manager as any;
      this.droppable.manager = manager as any;
    });
  }

  #element: Element | undefined;

  public set element(element: Element | undefined) {
    batch(() => {
      const previousElement = this.#element;
      const droppableElement = this.droppable.element;
      const draggableElement = this.draggable.element;

      if (!droppableElement || droppableElement === previousElement) {
        this.droppable.element = element;
      }

      if (!draggableElement || draggableElement === previousElement) {
        this.draggable.element = element;
      }

      this.#element = element;
    });
  }

  public get element() {
    const element = this.#element;

    if (!element) return;

    return ProxiedElements.get(element) ?? element ?? this.droppable.element;
  }

  public set target(target: Element | undefined) {
    this.droppable.element = target;
  }

  public get target() {
    return this.droppable.element;
  }

  public set source(source: Element | undefined) {
    this.draggable.element = source;
  }

  public get source() {
    return this.draggable.element;
  }

  public get disabled() {
    return this.draggable.disabled && this.droppable.disabled;
  }

  public set feedback(value: FeedbackType) {
    this.draggable.feedback = value;
  }

  public set disabled(value: boolean) {
    batch(() => {
      this.droppable.disabled = value;
      this.draggable.disabled = value;
    });
  }

  public set data(data: T) {
    batch(() => {
      this.droppable.data = data;
      this.draggable.data = data;
    });
  }

  public set handle(handle: Element | undefined) {
    this.draggable.handle = handle;
  }

  public set id(id: UniqueIdentifier) {
    this.droppable.id = id;
    this.draggable.id = id;
  }

  public get id() {
    return this.droppable.id;
  }

  public set sensors(value: Sensors | undefined) {
    this.draggable.sensors = value;
  }

  public set modifiers(value: Modifiers | undefined) {
    this.draggable.modifiers = value;
  }

  public set collisionPriority(value: CollisionPriority | number | undefined) {
    this.droppable.collisionPriority = value;
  }

  public set collisionDetector(value: CollisionDetector | undefined) {
    this.droppable.collisionDetector = value ?? defaultCollisionDetection;
  }

  public set alignment(value: Alignment | undefined) {
    this.draggable.alignment = value;
  }

  public get alignment() {
    return this.draggable.alignment;
  }

  public set type(type: Type | undefined) {
    batch(() => {
      this.droppable.type = type;
      this.draggable.type = type;
    });
  }

  public get type() {
    return this.draggable.type;
  }

  public set accept(value: Droppable['accept']) {
    this.droppable.accept = value;
  }

  public get accept() {
    return this.droppable.accept;
  }

  public get isDropTarget() {
    return this.droppable.isDropTarget;
  }

  /**
   * A boolean indicating whether the sortable item is the source of a drag operation.
   */
  public get isDragSource() {
    return this.draggable.isDragSource;
  }

  /**
   * A boolean indicating whether the sortable item is being dragged.
   */
  public get isDragging() {
    return this.draggable.isDragging;
  }

  /**
   * A boolean indicating whether the sortable item is being dropped.
   */
  public get isDropping() {
    return this.draggable.isDropping;
  }

  public get status() {
    return this.draggable.status;
  }

  public refreshShape() {
    return this.droppable.refreshShape();
  }

  public accepts(draggable: Draggable): boolean {
    return this.droppable.accepts(draggable);
  }

  public register = () => {
    batch(() => {
      this.manager?.registry.register(this.droppable);
      this.manager?.registry.register(this.draggable);
    });

    return () => this.unregister();
  };

  public unregister = () => {
    batch(() => {
      this.manager?.registry.unregister(this.droppable);
      this.manager?.registry.unregister(this.draggable);
    });
  };

  public destroy = () => {
    batch(() => {
      this.droppable.destroy();
      this.draggable.destroy();
    });
  };
}

export class SortableDraggable<T extends Data> extends Draggable<T> {
  constructor(
    input: DraggableInput<T>,
    manager: DragDropManager | undefined,
    public sortable: Sortable<T>
  ) {
    super(input, manager);
  }

  get index() {
    return this.sortable.index;
  }

  get initialIndex() {
    return this.sortable.initialIndex;
  }

  get group() {
    return this.sortable.group;
  }

  get initialGroup() {
    return this.sortable.initialGroup;
  }
}

export class SortableDroppable<T extends Data> extends Droppable<T> {
  constructor(
    input: DraggableInput<T>,
    manager: DragDropManager | undefined,
    public sortable: Sortable<T>
  ) {
    super(input, manager);
  }

  get index() {
    return this.sortable.index;
  }

  get group() {
    return this.sortable.group;
  }
}
