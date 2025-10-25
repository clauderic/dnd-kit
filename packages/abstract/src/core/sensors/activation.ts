export class ActivationController<E extends Event> extends AbortController {
  public activated = false;

  constructor(
    private constraints: ActivationConstraints<E> | undefined,
    private onActivate: (event: E) => void
  ) {
    super();

    for (const constraint of constraints ?? []) {
      constraint.controller = this;
    }
  }

  onEvent(event: E) {
    if (this.activated) return;

    if (this.constraints?.length) {
      for (const constraint of this.constraints) {
        constraint.onEvent(event);
      }
    } else {
      this.activate(event);
    }
  }

  activate(event: E) {
    if (this.activated) return;
    this.activated = true;
    this.onActivate(event);
  }

  abort(event?: E) {
    this.activated = false;

    super.abort(event);
  }
}

export interface ActivationConstraintOptions {}

export abstract class ActivationConstraint<
  E extends Event = Event,
  O extends ActivationConstraintOptions = ActivationConstraintOptions,
> {
  #controller: ActivationController<E> | undefined;

  set controller(controller: ActivationController<E>) {
    this.#controller = controller;

    controller.signal.addEventListener('abort', () => this.abort());
  }

  constructor(protected options: O) {}

  /**
   * Called when the activation is triggered.
   */
  public activate(event: E): void {
    this.#controller?.activate(event);
  }

  /**
   * Called when the activation is aborted.
   */
  public abort(event?: E): void {
    this.#controller?.abort(event);
  }

  /**
   * Called when an input event is received by the sensor.
   * Returns `true` if this event triggers activation immediately.
   */
  public abstract onEvent(event: E): void;
}

export type ActivationConstraints<E extends Event> = ActivationConstraint<E>[];
