export class Listeners {
  private document: Document;
  private listeners: {
    eventName: string;
    handler: EventListenerOrEventListenerObject;
  }[] = [];

  constructor(target: Event['target']) {
    this.document =
      target instanceof HTMLElement ? target.ownerDocument : document;
  }

  public add(
    eventName: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions
  ) {
    this.document.addEventListener(eventName, handler, options);
    this.listeners.push({eventName, handler});
  }

  public removeAll() {
    this.listeners.forEach(({eventName, handler}) =>
      this.document.removeEventListener(eventName, handler)
    );
  }
}
