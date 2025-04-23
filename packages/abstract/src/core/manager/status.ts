import {derived, reactive} from '@dnd-kit/state';

/**
 * Enum representing the possible states of a drag operation.
 */
export enum StatusValue {
  /** No drag operation is in progress */
  Idle = 'idle',
  /** A drag operation is about to start */
  InitializationPending = 'initialization-pending',
  /** A drag operation is being initialized */
  Initializing = 'initializing',
  /** A drag operation is in progress */
  Dragging = 'dragging',
  /** A drag operation has completed */
  Dropped = 'dropped',
}

/**
 * Manages the status of a drag operation.
 *
 * @remarks
 * This class provides reactive accessors for checking the current state
 * of a drag operation and methods for updating it.
 */
export class Status {
  /** The current status value */
  @reactive
  private accessor value: StatusValue = StatusValue.Idle;

  /**
   * Gets the current status value.
   *
   * @returns The current status value
   */
  @derived
  public get current(): StatusValue {
    return this.value;
  }

  /**
   * Checks if the status is idle.
   *
   * @returns true if no drag operation is in progress
   */
  @derived
  public get idle(): boolean {
    return this.value === StatusValue.Idle;
  }

  /**
   * Checks if the status is initializing.
   *
   * @returns true if a drag operation is being initialized
   */
  @derived
  public get initializing(): boolean {
    return this.value === StatusValue.Initializing;
  }

  /**
   * Checks if the status is initialized.
   *
   * @returns true if a drag operation has started initialization
   */
  @derived
  public get initialized(): boolean {
    return this.value !== StatusValue.Idle;
  }

  /**
   * Checks if the status is dragging.
   *
   * @returns true if a drag operation is in progress
   */
  @derived
  public get dragging(): boolean {
    return this.value === StatusValue.Dragging;
  }

  /**
   * Checks if the status is dropped.
   *
   * @returns true if a drag operation has completed
   */
  @derived
  public get dropped(): boolean {
    return this.value === StatusValue.Dropped;
  }

  /**
   * Sets the current status value.
   *
   * @param value - The new status value
   */
  public set(value: StatusValue) {
    this.value = value;
  }
}
