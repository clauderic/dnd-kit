export class Listeners {
  private listeners: {
    eventName: string;
    handler: EventListenerOrEventListenerObject;
  }[] = [];

  constructor(private target: EventTarget) {}

  public add(
    eventName: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | false
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
