import {derived, reactive} from '@dnd-kit/state';

export enum StatusValue {
  Idle = 'idle',
  InitializationPending = 'initialization-pending',
  Initializing = 'initializing',
  Dragging = 'dragging',
  Dropped = 'dropped',
}

export class Status {
  @reactive
  private accessor value: StatusValue = StatusValue.Idle;

  @derived
  public get current(): StatusValue {
    return this.value;
  }

  @derived
  public get idle(): boolean {
    return this.value === StatusValue.Idle;
  }

  @derived
  public get initializing(): boolean {
    return this.value === StatusValue.Initializing;
  }

  @derived
  public get initialized(): boolean {
    return this.value !== StatusValue.Idle;
  }

  @derived
  public get dragging(): boolean {
    return this.value === StatusValue.Dragging;
  }

  @derived
  public get dropped(): boolean {
    return this.value === StatusValue.Dropped;
  }

  public set(value: StatusValue) {
    this.value = value;
  }
}
