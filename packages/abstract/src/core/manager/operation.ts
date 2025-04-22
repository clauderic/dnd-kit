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

export class DragOperation<T extends Draggable, U extends Droppable>
  implements DragOperationSnapshot<T, U>
{
  constructor(manager: DragDropManager<T, U>) {
    this.#manager = manager;
  }

  #manager: DragDropManager<T, U>;

  #previousSource?: T;

  #shape = new ValueHistory<Shape | undefined>(undefined, (a, b) =>
    a && b ? a.equals(b) : a === b
  );

  public readonly status = new Status();

  @derived
  public get shape(): WithHistory<Shape> | null {
    const {current, initial, previous} = this.#shape;

    if (!current || !initial) {
      return null;
    }

    return {current, initial, previous};
  }

  public set shape(value: Shape | null) {
    if (!value) {
      this.#shape.reset();
    } else {
      this.#shape.current = value;
    }
  }

  @reactive
  public accessor canceled = false;

  @reactive
  public accessor activatorEvent: Event | null = null;

  @reactive
  public accessor sourceIdentifier: UniqueIdentifier | null = null;

  @reactive
  public accessor targetIdentifier: UniqueIdentifier | null = null;

  @reactive
  public accessor modifiers: Modifier[] = [];

  public position = new Position({x: 0, y: 0});

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

  @derived
  public get target(): U | null {
    const identifier = this.targetIdentifier;
    return identifier != null
      ? (this.#manager.registry.droppables.get(identifier) ?? null)
      : null;
  }

  #transform = {x: 0, y: 0};

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
