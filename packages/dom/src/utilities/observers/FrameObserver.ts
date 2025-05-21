import {getFrameElements} from '../frame/getFrameElements.ts';
import {throttle} from '../scheduling/throttle.ts';
import {
  PositionObserver,
  THROTTLE_INTERVAL,
  type PositionObserverCallback,
} from './PositionObserver.ts';

const framePositionObservers = new WeakMap<
  Element,
  {
    disconnect: () => void;
    callbacks: Set<PositionObserverCallback>;
  }
>();

const scrollListeners = new WeakMap<
  Document,
  {
    disconnect: () => void;
    listeners: Set<EventListener>;
  }
>();

function addFrameListener(frame: Element, callback: PositionObserverCallback) {
  // Check if already observed globally
  let cached = framePositionObservers.get(frame);

  if (!cached) {
    const observer = new PositionObserver(
      frame,
      (boundingClientRect) => {
        const cached = framePositionObservers.get(frame);
        if (!cached) return;

        cached.callbacks.forEach((callback) => callback(boundingClientRect));
      },
      {skipInitial: true}
    );

    cached = {disconnect: observer.disconnect, callbacks: new Set()};
  }

  cached.callbacks.add(callback);
  framePositionObservers.set(frame, cached);

  return () => {
    cached.callbacks.delete(callback);

    if (cached.callbacks.size === 0) {
      framePositionObservers.delete(frame);
      cached.disconnect();
    }
  };
}

function observeParentFrames(
  frames: Set<Element>,
  callback: PositionObserverCallback
) {
  const cleanup = new Set<() => void>();

  for (const frame of frames) {
    const remove = addFrameListener(frame, callback);
    cleanup.add(remove);
  }

  return () => cleanup.forEach((remove) => remove());
}

function addScrollListener(element: Element, callback: EventListener) {
  const doc = element.ownerDocument;

  if (!scrollListeners.has(doc)) {
    const controller = new AbortController();
    const listeners = new Set<EventListener>();

    document.addEventListener(
      'scroll',
      (event) => listeners.forEach((listener) => listener(event)),
      {
        capture: true,
        passive: true,
        signal: controller.signal,
      }
    );

    scrollListeners.set(doc, {disconnect: () => controller.abort(), listeners});
  }

  const {listeners, disconnect} = scrollListeners.get(doc) ?? {};

  if (!listeners || !disconnect) return () => {};

  listeners.add(callback);

  return () => {
    listeners.delete(callback);

    if (listeners.size === 0) {
      disconnect();
      scrollListeners.delete(doc);
    }
  };
}

export class FrameObserver {
  #elementObserver: PositionObserver;
  #disconnected = false;
  #frames: Set<Element>;

  constructor(
    element: Element,
    private callback: PositionObserverCallback,
    options?: {debug?: boolean}
  ) {
    const frames = getFrameElements(element);
    const unobserveParentFrames = observeParentFrames(frames, callback);
    const removeScrollListener = addScrollListener(element, this.#handleScroll);

    this.#frames = frames;
    this.#elementObserver = new PositionObserver(element, callback, options);
    this.disconnect = () => {
      if (this.#disconnected) return;
      this.#disconnected = true;

      unobserveParentFrames();
      removeScrollListener();
      this.#elementObserver.disconnect();
    };
  }

  disconnect: () => void;

  #handleScroll = throttle((event: Event) => {
    if (this.#disconnected) return;
    if (!event.target) return;
    if (
      'contains' in event.target &&
      typeof event.target.contains === 'function'
    ) {
      for (const frame of this.#frames) {
        if (event.target.contains(frame)) {
          this.callback(this.#elementObserver.boundingClientRect);
          break;
        }
      }
    }
  }, THROTTLE_INTERVAL);
}
