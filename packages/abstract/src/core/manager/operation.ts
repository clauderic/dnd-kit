import {Position, type Shape} from '@dnd-kit/geometry';
import type {Coordinates} from '@dnd-kit/geometry';
import {
  batch,
  derived,
  reactive,
  snapshot,
  untracked,
  ValueHistory,
  type WithHistory,
} from '@dnd-kit/state';

import type {
  Draggable,
  Droppable,
  UniqueIdentifier,
} from '../entities/index.ts';
import type {Modifier} from '../modifiers/index.ts';

import type {DragDropManager} from './manager.ts';
import {Status, StatusValue} from './status.ts';

export interface DragOperationSnapshot<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
> {
  readonly activatorEvent: Event | null;
  readonly canceled: boolean;
  readonly position: Position;
  readonly transform: Coordinates;
  readonly status: Status;
  get shape(): WithHistory<Shape> | null;
  set shape(value: Shape | null);
  readonly source: T | null;
  readonly target: U | null;
}

/**
 * Represents the current state of a drag operation.
 *
 * @template T - The type of draggable entities
 * @template U - The type of droppable entities
 */
export class DragOperation<T extends Draggable, U extends Droppable>
  implements DragOperationSnapshot<T, U>
{
  /**
   * Creates a new drag operation instance.
   *
   * @param manager - The drag and drop manager that owns this operation
   */
  constructor(manager: DragDropManager<T, U>) {
    this.#manager = manager;
  }

  #manager: DragDropManager<T, U>;

  #previousSource?: T;

  #shape = new ValueHistory<Shape | undefined>(undefined, (a, b) =>
    a && b ? a.equals(b) : a === b
  );

  /** Current status of the drag operation */
  public readonly status = new Status();

  /**
   * Gets the current shape of the dragged entity with history.
   *
   * @returns The shape history or null if no shape is set
   */
  @derived
  public get shape(): WithHistory<Shape> | null {
    const {current, initial, previous} = this.#shape;

    if (!current || !initial) {
      return null;
    }

    return {current, initial, previous};
  }

  /**
   * Sets the shape of the dragged entity.
   *
   * @param value - The new shape or null to reset
   */
  public set shape(value: Shape | null) {
    if (!value) {
      this.#shape.reset();
    } else {
      this.#shape.current = value;
    }
  }

  /** Whether the drag operation was canceled */
  @reactive
  public accessor canceled = false;

  /** The event that initiated the drag operation */
  @reactive
  public accessor activatorEvent: Event | null = null;

  /** Unique identifier of the source draggable entity */
  @reactive
  public accessor sourceIdentifier: UniqueIdentifier | null = null;

  /** Unique identifier of the target droppable entity */
  @reactive
  public accessor targetIdentifier: UniqueIdentifier | null = null;

  /** List of modifiers applied to the drag operation */
  @reactive
  public accessor modifiers: Modifier[] = [];

  /** Current position of the dragged entity */
  public position = new Position({x: 0, y: 0});

  /**
   * Gets the source draggable entity.
   *
   * @returns The current draggable entity or the previous one if the current is not found
   */
  @derived
  public get source(): T | null {
    const identifier = this.sourceIdentifier;
    if (identifier == null) return null;

    const value = this.#manager.registry.draggables.get(identifier);

    if (value) {
      this.#previousSource = value;
    }

    return value ?? this.#previousSource ?? null;
  }

  /**
   * Gets the target droppable entity.
   *
   * @returns The current droppable entity or null if not found
   */
  @derived
  public get target(): U | null {
    const identifier = this.targetIdentifier;
    return identifier != null
      ? (this.#manager.registry.droppables.get(identifier) ?? null)
      : null;
  }

  #transform = {x: 0, y: 0};

  /**
   * Gets the current transform after applying all modifiers.
   *
   * @returns The transformed coordinates
   */
  @derived
  public get transform() {
    const {x, y} = this.position.delta;
    let transform = {x, y};

    for (const modifier of this.modifiers) {
      transform = modifier.apply({
        ...this.snapshot(),
        transform,
      });
    }

    this.#transform = transform;

    return transform;
  }

  /**
   * Creates a snapshot of the current drag operation state.
   *
   * @returns An immutable snapshot of the current operation state
   */
  public snapshot(): DragOperationSnapshot<T, U> {
    return untracked(() => ({
      source: this.source,
      target: this.target,
      activatorEvent: this.activatorEvent,
      transform: this.#transform,
      shape: this.shape,
      position: snapshot(this.position),
      status: snapshot(this.status),
      canceled: this.canceled,
    }));
  }

  /**
   * Resets the drag operation to its initial state.
   *
   * @remarks
   * This method:
   * - Sets status to idle
   * - Clears source and target identifiers
   * - Resets shape history
   * - Resets position and transform
   * - Clears modifiers
   */
  public reset() {
    batch(() => {
      this.status.set(StatusValue.Idle);
      this.sourceIdentifier = null;
      this.targetIdentifier = null;
      this.#shape.reset();
      this.position.reset({x: 0, y: 0});
      this.#transform = {x: 0, y: 0};
      this.modifiers = [];
    });
  }
}
