import {canUseDOM} from '../execution-context/canUseDOM.ts';

const Observer = canUseDOM
  ? ResizeObserver
  : class MockResizeObserver implements ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

export class ResizeNotifier extends Observer {
  #initialized = false;

  constructor(callback: ResizeObserverCallback) {
    super((entries) => {
      if (!this.#initialized) {
        this.#initialized = true;
        return;
      }
      callback(entries, this);
    });
  }
}
