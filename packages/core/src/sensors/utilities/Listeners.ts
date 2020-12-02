export class Listeners {
  private listeners: {
    eventName: string;
    handler: EventListenerOrEventListenerObject;
  }[] = [];

  constructor(private target: HTMLElement | Document) {}

  public add(
    eventName: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions
  ) {
    this.target.addEventListener(eventName, handler, options);
    this.listeners.push({eventName, handler});
  }

  public removeAll() {
    this.listeners.forEach(({eventName, handler}) =>
      this.target.removeEventListener(eventName, handler)
    );
  }
}
