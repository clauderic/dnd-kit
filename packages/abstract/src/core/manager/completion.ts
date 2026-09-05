import {signal} from '@dnd-kit/state';
import type {DragDropManager} from './manager.ts';

// Action bookkeeping stays inside the abstract package. Neither plugins nor
// event objects carry a completion token or capability.
class ActionState {
  pending = signal(0);
  #actions = new Set<object>();
  #inputs: (() => void)[] = [];

  input(callback: (complete: () => void) => void, sequential: boolean) {
    const release = this.begin();
    const start = () =>
      callback(() => {
        release();
        if (this.#inputs[0] !== start) return;
        this.#inputs.shift();
        const next = this.#inputs[0];
        if (next)
          queueMicrotask(() => {
            if (this.#inputs[0] !== next) return;
            // A deferred input no longer has a synchronous caller. Its failure
            // still cancels default movement and completes its action bookkeeping.
            try {
              next();
            } catch {}
          });
      });
    if (sequential) {
      this.#inputs.push(start);
      if (this.#inputs.length === 1) start();
    } else {
      start();
    }
  }

  begin() {
    const action = {};
    this.#actions.add(action);
    this.pending.value = this.#actions.size;
    return () => {
      if (this.#actions.delete(action)) this.pending.value = this.#actions.size;
    };
  }

  reset() {
    this.#inputs.length = 0;
    this.#actions.clear();
    this.pending.value = 0;
  }
}

const states = new WeakMap<DragDropManager<any, any>, ActionState>();

export function actionState(manager: DragDropManager<any, any>) {
  let state = states.get(manager);
  if (!state) {
    state = new ActionState();
    states.set(manager, state);
  }
  return state;
}

type Result = {error: unknown} | undefined;
const dispatches = new WeakMap<object, Promise<Result>[]>();

/** Record returned work only while an action is dispatching its own event. */
export function recordCompletion(event: object, result: unknown) {
  const pending = dispatches.get(event);
  if (
    pending &&
    result != null &&
    typeof (result as PromiseLike<unknown>).then === 'function'
  ) {
    // Observe rejection immediately, but let every sibling finish before the
    // action settles. A rejected handler cannot reopen a partially committed layout.
    pending.push(
      Promise.resolve(result).then(
        () => undefined,
        (error) => ({error})
      )
    );
  }
}

export function dispatchWithCompletion(
  event: object,
  dispatch: () => void,
  onError?: (error: unknown) => void
) {
  const pending: Promise<Result>[] = [];
  dispatches.set(event, pending);
  try {
    dispatch();
  } catch (error) {
    pending.push(Promise.resolve({error}));
    onError?.(error);
  } finally {
    dispatches.delete(event);
  }
  if (!pending.length) return;
  return Promise.all(pending).then((results) => {
    const failure = results.find((result) => result !== undefined);
    if (failure) throw failure.error;
  });
}

export async function finishAction(
  work: Promise<void>,
  render: () => Promise<void>
) {
  let rendering: Promise<void>;
  try {
    rendering = render();
  } catch (error) {
    rendering = Promise.reject(error);
  }
  const results = await Promise.allSettled([work, rendering]);
  // Handlers may start another commit before resolving or rejecting. Finish it
  // before reporting failure or allowing another collision decision.
  try {
    await render();
  } catch (reason) {
    results.push({status: 'rejected', reason});
  }
  for (const result of results) {
    if (result.status === 'rejected') throw result.reason;
  }
}
