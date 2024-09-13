import {isRectEqual} from './isRectEqual.ts';

const THRESHOLD = [
  0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65,
  0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 0.99, 1,
];

type PositionObserverCallback = (
  boundingClientRect: DOMRectReadOnly | null
) => void;

export class PositionObserver {
  constructor(
    private element: Element,
    callback: PositionObserverCallback,
    options: {debug?: boolean} = {debug: false}
  ) {
    this.#callback = callback;
    this.boundingClientRect = element.getBoundingClientRect();

    if (options?.debug) {
      this.#debug = document.createElement('div');
      this.#debug.style.background = 'rgba(0,0,0,0.15)';
      this.#debug.style.position = 'fixed';
      this.#debug.style.pointerEvents = 'none';
      element.ownerDocument.body.appendChild(this.#debug);
    }

    this.#visibilityObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const entry = entries[entries.length - 1];
        const {
          boundingClientRect,
          intersectionRect,
          isIntersecting: visible,
          intersectionRatio,
        } = entry;
        const {width, height} = boundingClientRect;

        if (!width && !height) return;

        if (intersectionRatio < 1 && intersectionRatio > 0) {
          this.#visibleRect = intersectionRect;
          this.#offsetLeft = intersectionRect.left - boundingClientRect.left;
          this.#offsetTop = intersectionRect.top - boundingClientRect.top;
        } else {
          this.#visibleRect = undefined;
          this.#offsetLeft = 0;
          this.#offsetTop = 0;
        }

        this.#observePosition();

        if (this.#visible && !visible) {
          this.#positionObserver?.disconnect();
          this.#callback(null);
          this.#resizeObserver?.disconnect();
          this.#resizeObserver = undefined;

          if (this.#debug) this.#debug.style.visibility = 'hidden';
        }

        if (visible && !this.#resizeObserver) {
          this.#resizeObserver = new ResizeObserver(this.#observePosition);
          this.#resizeObserver.observe(element);
        }

        this.#visible = visible;
      },
      {
        threshold: THRESHOLD,
        root: element.ownerDocument ?? document,
      }
    );

    this.#callback(this.boundingClientRect);
    this.#visibilityObserver.observe(element);
  }

  public boundingClientRect: DOMRectReadOnly;

  public disconnect() {
    this.#resizeObserver?.disconnect();
    this.#positionObserver?.disconnect();
    this.#visibilityObserver.disconnect();
    this.#debug?.remove();
  }

  #callback: PositionObserverCallback;
  #visible = true;
  #offsetTop = 0;
  #offsetLeft = 0;
  #visibleRect: DOMRectReadOnly | undefined;
  #previousBoundingClientRect: DOMRectReadOnly | undefined;
  #resizeObserver: ResizeObserver | undefined;
  #positionObserver: IntersectionObserver | undefined;
  #visibilityObserver: IntersectionObserver;
  #debug: HTMLElement | undefined;

  #observePosition = () => {
    const {element} = this;

    if (!element.isConnected) {
      this.disconnect();
      return;
    }

    const root = element.ownerDocument ?? document;
    const {innerHeight, innerWidth} = root.defaultView ?? window;
    const {width, height} = this.#visibleRect ?? this.boundingClientRect;
    const rect = element.getBoundingClientRect();
    const top = rect.top + this.#offsetTop;
    const left = rect.left + this.#offsetLeft;
    const bottom = top + height;
    const right = left + width;
    const insetTop = Math.floor(top);
    const insetLeft = Math.floor(left);
    const insetRight = Math.floor(innerWidth - right);
    const insetBottom = Math.floor(innerHeight - bottom);
    const rootMargin = `${-insetTop}px ${-insetRight}px ${-insetBottom}px ${-insetLeft}px`;

    this.#positionObserver?.disconnect();
    this.#positionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        const {boundingClientRect, intersectionRatio} = entry;

        const previous = this.boundingClientRect;
        this.boundingClientRect =
          intersectionRatio === 1
            ? boundingClientRect
            : element.getBoundingClientRect();

        if (
          previous.width > width ||
          previous.height > height ||
          !isRectEqual(this.boundingClientRect, previous)
        ) {
          this.#observePosition();
        }
      },
      {
        threshold: [0, 1],
        rootMargin,
        root,
      }
    );

    this.#positionObserver.observe(element);
    this.#notify();
  };

  async #notify() {
    if (isRectEqual(this.boundingClientRect, this.#previousBoundingClientRect))
      return;

    this.#updateDebug();
    this.#callback(this.boundingClientRect);
    this.#previousBoundingClientRect = this.boundingClientRect;
  }

  #updateDebug() {
    if (this.#debug) {
      const {top, left, width, height} = this.boundingClientRect;

      this.#debug.style.visibility = 'visible';
      this.#debug.style.top = `${top}px`;
      this.#debug.style.left = `${left}px`;
      this.#debug.style.width = `${width}px`;
      this.#debug.style.height = `${height}px`;
    }
  }
}
