import type {
  Data,
  DragDropManager as AbstractDragDropManager,
  Type,
  UniqueIdentifier,
} from '@dnd-kit/abstract';
import {batch, effects, reactive, untracked} from '@dnd-kit/state';

import {Draggable, Droppable} from '../../nodes';
import type {DraggableInput, FeedbackType, DroppableInput} from '../../nodes';
import type {Sensors} from '../../sensors';

import {SortableKeyboardPlugin} from './SortableKeyboardPlugin';
import {Shape} from '@dnd-kit/geometry';
import {scheduler} from '@dnd-kit/dom-utilities';

export interface SortableInput<T extends Data>
  extends DraggableInput<T>,
    DroppableInput<T> {
  index: number;
}

export class Sortable<T extends Data = Data> {
  protected draggable: Draggable<T>;
  protected droppable: Droppable<T>;

  @reactive
  index: number;

  constructor(
    {index, sensors, ...input}: SortableInput<T>,
    protected manager: AbstractDragDropManager<any, any>
  ) {
    this.draggable = new SortableDraggable<T>({...input, sensors}, manager);
    this.droppable = new SortableDroppable<T>(input, manager);

    manager.registry.register(SortableKeyboardPlugin);

    let previousIndex = index;

    this.index = index;

    const {destroy} = this;

    const animate = () => {
      const {shape} = this.droppable;

      if (!shape) {
        return;
      }

      scheduler.schedule(() => {
        const {element} = this.droppable;

        if (!element) {
          return;
        }

        this.droppable.refreshShape();
        const updatedShape = this.droppable.shape;

        if (!updatedShape) {
          return;
        }

        const delta = {
          x: shape.boundingRectangle.left - updatedShape.boundingRectangle.left,
          y: shape.boundingRectangle.top - updatedShape.boundingRectangle.top,
        };

        if (delta.x || delta.y) {
          element.animate(
            {
              transform: [
                `translate3d(${delta.x}px, ${delta.y}px, 0)`,
                'translate3d(0, 0, 0)',
              ],
            },
            {duration: 200, easing: 'ease-in-out'}
          );
        }
      });
    };

    const cleanup = effects(
      () => {
        const {index} = this;

        // Re-run this effect whenever the index changes
        if (index === previousIndex) {
          return;
        }

        previousIndex = index;

        untracked(animate);
      },
      () => {
        const {target} = this;
        const {feedback, isDragSource} = this.draggable;

        if (feedback == 'move' && isDragSource) {
          this.droppable.disabled = !target;
        }
      },
      () => {
        const {element} = this;

        this.droppable.element = element;
        this.draggable.element = element;
      },
      () => {
        const {target} = this;
        const element = untracked(() => this.element);

        this.droppable.element = !target && element ? element : target;
      },
      () => {
        const {source} = this;
        const element = untracked(() => this.element);

        this.draggable.element = !source && element ? element : source;
      }
    );

    this.destroy = () => {
      destroy.bind(this)();
      cleanup();
    };
  }

  public get disabled() {
    return this.draggable.disabled && this.droppable.disabled;
  }

  public set feedback(value: FeedbackType) {
    this.draggable.feedback = value;
  }

  public set disabled(value: boolean) {
    batch(() => {
      this.draggable.disabled = value;
      this.droppable.disabled = value;
    });
  }

  public set data(data: T | null) {
    batch(() => {
      this.draggable.data = data;
      this.droppable.data = data;
    });
  }

  public set activator(activator: Element | undefined) {
    this.draggable.activator = activator;
  }

  @reactive
  element: Element | undefined;

  @reactive
  source: Element | undefined;

  @reactive
  target: Element | undefined;

  public set id(id: UniqueIdentifier) {
    batch(() => {
      this.draggable.id = id;
      this.droppable.id = id;
    });
  }

  public set sensors(value: Sensors | undefined) {
    this.draggable.sensors = value;
  }

  public set type(type: Type | undefined) {
    this.draggable.type = type;
  }

  public set accept(value: Type[] | undefined) {
    this.droppable.accept = value;
  }

  public get isDropTarget() {
    return this.droppable.isDropTarget;
  }

  public get isDragSource() {
    return this.draggable.isDragSource;
  }

  public refreshShape() {
    this.droppable.refreshShape();
  }

  public accepts(types: Type | Type[]): boolean {
    return this.droppable.accepts(types);
  }

  public destroy() {
    this.draggable.destroy();
    this.droppable.destroy();
  }
}

export class SortableDraggable<T extends Data> extends Draggable<T> {}

export class SortableDroppable<T extends Data> extends Droppable<T> {
  public refreshShape(): Shape | undefined {
    return super.refreshShape(true);
  }
}
