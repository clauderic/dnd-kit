export interface EventListenerDescriptor {
  type: string;
  listener(event: Event): void;
  options?: AddEventListenerOptions;
}

type EventListenerInput = EventListenerDescriptor[] | EventListenerDescriptor;

type EventListenerEntry = [EventTarget, EventListenerDescriptor];

export class Listeners {
  private entries: Set<EventListenerEntry> = new Set();

  constructor() {}

  public bind(target: EventTarget, input: EventListenerInput) {
    const listeners = Array.isArray(input) ? input : [input];
    const entries: EventListenerEntry[] = [];

    for (const descriptor of listeners) {
      const {type, listener, options} = descriptor;
      const entry: EventListenerEntry = [target, descriptor];

      target.addEventListener(type, listener, options);
      this.entries.add(entry);
      entries.push(entry);
    }

    return function cleanup() {
      for (const [target, {type, listener, options}] of entries) {
        target.removeEventListener(type, listener, options);
      }
    };
  }

  public clear = () => {
    for (const entry of this.entries) {
      const [target, {type, listener, options}] = entry;

      target.removeEventListener(type, listener, options);
    }

    this.entries.clear();
  };
}
