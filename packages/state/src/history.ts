import {batch, untracked} from '@preact/signals-core';

import {enumerable, reactive} from './decorators.ts';

export type WithHistory<T> = {
  current: T;
  initial: T;
  previous: T | undefined;
};

export class ValueHistory<T> implements WithHistory<T> {
  constructor(
    protected readonly defaultValue: T,
    protected readonly equals: (a: T, b: T) => boolean = Object.is
  ) {
    this.reset = this.reset.bind(this);
    this.reset();
  }

  @reactive
  // @ts-ignore
  accessor #initial: T;

  @reactive
  // @ts-ignore
  accessor #previous: T | undefined;

  @reactive
  // @ts-ignore
  accessor #current: T;

  /** Current value */
  @enumerable()
  public get current(): T {
    return this.#current;
  }

  /** Initial value */
  @enumerable()
  public get initial(): T {
    return this.#initial;
  }

  /** Previous value */
  @enumerable()
  public get previous(): T | undefined {
    return this.#previous;
  }

  /** Set the current value */
  public set current(value: T) {
    const current = untracked(() => this.#current);

    if (value && current && this.equals(current, value)) {
      return;
    }

    batch(() => {
      if (!this.#initial) {
        this.#initial = value;
      }

      this.#previous = current;
      this.#current = value;
    });
  }

  /** Reset the state to the initial value */
  public reset(value = this.defaultValue) {
    batch(() => {
      this.#previous = undefined;
      this.#initial = value;
      this.#current = value;
    });
  }
}
