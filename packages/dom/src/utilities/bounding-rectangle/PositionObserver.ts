import {getFirstScrollableAncestor} from '../scroll/getScrollableAncestors.ts';
import {isRectEqual} from './isRectEqual.ts';
import {Listeners} from '../event-listeners/index.ts';

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

    const doc = element.ownerDocument ?? document;
    const scrollableAncestor = getFirstScrollableAncestor(element);

    this.#visibilityObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const entry = entries[entries.length - 1];
        const {isIntersecting: visible} = entry;

        if (visible) {
          this.#partialVisibilityObserver.observe(element);
          this.#resizeObserver.observe(element);
          this.#observePosition();

          if (scrollableAncestor) {
            this.#listeners.bind(scrollableAncestor, {
              type: 'scroll',
              listener: this.#observePosition,
              options: {passive: true},
            });
          }
        } else {
          this.#positionObserver?.disconnect();
          this.#resizeObserver.disconnect();
          this.#partialVisibilityObserver?.disconnect();
          this.#callback(null);
          this.#listeners.clear();

          if (this.#debug) this.#debug.style.visibility = 'hidden';
        }
      },
      {
        root:
          scrollableAncestor === doc.scrollingElement
            ? doc
            : scrollableAncestor,
        rootMargin: '40%',
      }
    );

    this.#partialVisibilityObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const entry = entries[entries.length - 1];
        const {boundingClientRect, intersectionRect, intersectionRatio} = entry;
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
      },
      {
        threshold: THRESHOLD,
        root: element.ownerDocument ?? document,
      }
    );

    this.#resizeObserver = new ResizeObserver(this.#observePosition);

    this.#visibilityObserver.observe(element);
  }

  public boundingClientRect: DOMRectReadOnly;

  public disconnect() {
    this.#resizeObserver.disconnect();
    this.#positionObserver?.disconnect();
    this.#visibilityObserver.disconnect();
    this.#partialVisibilityObserver.disconnect();
    this.#debug?.remove();
    this.#listeners.clear();
  }

  #listeners = new Listeners();
  #callback: PositionObserverCallback;
  #offsetTop = 0;
  #offsetLeft = 0;
  #visibleRect: DOMRectReadOnly | undefined;
  #previousBoundingClientRect: DOMRectReadOnly | undefined;
  #resizeObserver: ResizeObserver;
  #positionObserver: IntersectionObserver | undefined;
  #visibilityObserver: IntersectionObserver;
  #partialVisibilityObserver: IntersectionObserver;
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
    if (
      !isRectEqual(this.boundingClientRect, this.#previousBoundingClientRect)
    ) {
      this.#updateDebug();
      this.#callback(this.boundingClientRect);
      this.#previousBoundingClientRect = this.boundingClientRect;
    }
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
