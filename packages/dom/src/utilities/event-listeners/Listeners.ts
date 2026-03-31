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

  public bind(target: EventTarget | EventTarget[], input: EventListenerInput) {
    const eventTargets = Array.isArray(target) ? target : [target];
    const listeners = Array.isArray(input) ? input : [input];
    const entries: EventListenerEntry[] = [];

    for (const target of eventTargets) {
      for (const descriptor of listeners) {
        const {type, listener, options} = descriptor;
        const entry: EventListenerEntry = [target, descriptor];

        target.addEventListener(type, listener, options);
        this.entries.add(entry);
        entries.push(entry);
      }
    }

    const allEntries = this.entries;

    return function cleanup() {
      for (const entry of entries) {
        const [target, {type, listener, options}] = entry;
        target.removeEventListener(type, listener, options);
        allEntries.delete(entry);
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
