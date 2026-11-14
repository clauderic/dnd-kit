import {BoundingRectangle} from '@dnd-kit/geometry';

import {throttle} from '../scheduling/throttle.ts';

import {isRectEqual} from '../bounding-rectangle/isRectEqual.ts';
import {isVisible} from '../bounding-rectangle/isVisible.ts';
import {getVisibleBoundingRectangle} from '../bounding-rectangle/getVisibleBoundingRectangle.ts';

import {ResizeNotifier} from './ResizeNotifier.ts';

export type PositionObserverCallback = (
  boundingClientRect: BoundingRectangle | null
) => void;

const threshold = Array.from({length: 100}, (_, index) => index / 100);
export const THROTTLE_INTERVAL = 75;

export class PositionObserver {
  constructor(
    public element: Element,
    public callback: PositionObserverCallback,
    options: {debug?: boolean; skipInitial?: boolean} = {
      debug: false,
      skipInitial: false,
    }
  ) {
    this.boundingClientRect = element.getBoundingClientRect();
    this.#visible = isVisible(element, this.boundingClientRect);

    let initial = true;
    this.callback = (boundingClientRect) => {
      if (initial) {
        initial = false;
        if (options.skipInitial) return;
      }

      callback(boundingClientRect);
    };

    const root = element.ownerDocument;

    if (options?.debug) {
      this.#debug = document.createElement('div');
      this.#debug.style.background = 'rgba(0,0,0,0.15)';
      this.#debug.style.position = 'fixed';
      this.#debug.style.pointerEvents = 'none';
      root.body.appendChild(this.#debug);
    }

    this.#visibilityObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const entry = entries[entries.length - 1];
        const {boundingClientRect, isIntersecting: visible} = entry;
        const {width, height} = boundingClientRect;
        const previousVisible = this.#visible;

        this.#visible = visible;

        if (!width && !height) return;

        if (previousVisible && !visible) {
          this.#positionObserver?.disconnect();
          this.callback(null);
          this.#resizeObserver?.disconnect();
          this.#resizeObserver = undefined;

          if (this.#debug) this.#debug.style.visibility = 'hidden';
        } else {
          this.#observePosition();
        }

        if (visible && !this.#resizeObserver) {
          this.#resizeObserver = new ResizeNotifier(this.#observePosition);
          this.#resizeObserver.observe(element);
        }
      },
      {
        threshold,
        root,
      }
    );

    if (this.#visible && !options.skipInitial) {
      this.callback(this.boundingClientRect);
    }

    this.#visibilityObserver.observe(element);
  }

  public boundingClientRect: DOMRectReadOnly;

  public disconnect = () => {
    this.#disconnected = true;
    this.#resizeObserver?.disconnect();
    this.#positionObserver?.disconnect();
    this.#visibilityObserver.disconnect();
    this.#debug?.remove();
  };

  #visible = true;
  #previousBoundingClientRect: DOMRectReadOnly | undefined;
  #resizeObserver: ResizeNotifier | undefined;
  #positionObserver: IntersectionObserver | undefined;
  #visibilityObserver: IntersectionObserver;
  #debug: HTMLElement | undefined;
  #disconnected = false;

  #observePosition = throttle(() => {
    const {element} = this;

    this.#positionObserver?.disconnect();

    if (this.#disconnected || !this.#visible || !element.isConnected) {
      return;
    }

    const root = element.ownerDocument ?? document;
    const {innerHeight, innerWidth} = root.defaultView ?? window;
    const clientRect = element.getBoundingClientRect();
    const visibleRect = getVisibleBoundingRectangle(element, clientRect);
    const {top, left, bottom, right} = visibleRect;
    const insetTop = -Math.floor(top);
    const insetLeft = -Math.floor(left);
    const insetRight = -Math.floor(innerWidth - right);
    const insetBottom = -Math.floor(innerHeight - bottom);
    const rootMargin = `${insetTop}px ${insetRight}px ${insetBottom}px ${insetLeft}px`;

    this.boundingClientRect = clientRect;

    /*
     * An element clipped on both sides of an axis by a scrollable ancestor can
     * move along that axis without the visible part of it changing, which no
     * intersection observer reports. Such an element keeps being observed
     * again at every interval.
     */
    const clippedOnBothSides =
      (clientRect.top < visibleRect.top &&
        clientRect.bottom > visibleRect.bottom) ||
      (clientRect.left < visibleRect.left &&
        clientRect.right > visibleRect.right);
    let initial = true;

    this.#positionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;

        /*
         * The initial entry is delivered as soon as the element is observed:
         * the element only needs to be observed again if it moved or resized
         * since it was measured. Any later entry means that the visible part
         * of the element changed.
         *
         * Comparing the intersection to the whole bounding rectangle of the
         * element (`entry.intersectionRatio`) never settles for an element that
         * an ancestor clips: it was observed again every 75ms, forever.
         */
        if (initial) {
          initial = false;

          if (
            !clippedOnBothSides &&
            isRectEqual(entry.boundingClientRect, clientRect)
          ) {
            return;
          }
        }

        this.#observePosition();
      },
      {
        threshold,
        rootMargin,
        root,
      }
    );

    this.#positionObserver.observe(element);
    this.#notify();
  }, THROTTLE_INTERVAL);

  #notify() {
    if (this.#disconnected) return;

    this.#updateDebug();

    if (isRectEqual(this.boundingClientRect, this.#previousBoundingClientRect))
      return;

    this.callback(this.boundingClientRect);
    this.#previousBoundingClientRect = this.boundingClientRect;
  }

  #updateDebug() {
    if (this.#debug) {
      const {top, left, width, height} = getVisibleBoundingRectangle(
        this.element
      );

      this.#debug.style.overflow = 'hidden';
      this.#debug.style.visibility = 'visible';
      this.#debug.style.top = `${Math.floor(top)}px`;
      this.#debug.style.left = `${Math.floor(left)}px`;
      this.#debug.style.width = `${Math.floor(width)}px`;
      this.#debug.style.height = `${Math.floor(height)}px`;
    }
  }
}
