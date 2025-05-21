export class ResizeNotifier extends ResizeObserver {
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
