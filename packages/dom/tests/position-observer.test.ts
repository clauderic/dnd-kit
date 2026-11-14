import {afterEach, beforeEach, describe, expect, it, mock} from 'bun:test';

import {
  PositionObserver,
  THROTTLE_INTERVAL,
} from '../src/utilities/observers/PositionObserver.ts';

interface Box {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const VIEWPORT = {innerWidth: 1000, innerHeight: 800};

function toRect({top, right, bottom, left}: Box): DOMRectReadOnly {
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);

  return {
    top,
    right,
    bottom,
    left,
    width,
    height,
    x: left,
    y: top,
  } as DOMRectReadOnly;
}

function intersect(a: Box, b: Box): Box {
  const box = {
    top: Math.max(a.top, b.top),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom),
    left: Math.max(a.left, b.left),
  };

  return box.right > box.left && box.bottom > box.top
    ? box
    : {top: 0, right: 0, bottom: 0, left: 0};
}

function area({top, right, bottom, left}: Box) {
  return Math.max(0, right - left) * Math.max(0, bottom - top);
}

/*
 * A scrollable ancestor that clips its content (`overflow: hidden`) and an
 * element inside it, positioned in viewport coordinates.
 */
const scrollerBox: Box = {top: 0, right: 300, bottom: 200, left: 0};
let elementBox: Box;

const documentElement = {} as Element;
const ownerDocument = {
  defaultView: VIEWPORT,
  documentElement,
} as unknown as Document;
const scroller = {
  ownerDocument,
  parentElement: documentElement,
  tagName: 'DIV',
  getBoundingClientRect: () => toRect(scrollerBox),
} as unknown as Element;
const element = {
  ownerDocument,
  parentElement: scroller,
  tagName: 'DIV',
  isConnected: true,
  getBoundingClientRect: () => toRect(elementBox),
} as unknown as Element;

/*
 * An intersection observer that reports what a browser would: the part of the
 * element inside the root, shrunk by `rootMargin`, and inside the scroller,
 * as an initial entry when the element is observed, and again on `deliver()`.
 */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  disconnected = false;

  constructor(
    private callback: IntersectionObserverCallback,
    private options: IntersectionObserverInit = {}
  ) {
    MockIntersectionObserver.instances.push(this);
  }

  observe() {
    queueMicrotask(() => this.deliver());
  }

  unobserve() {}

  disconnect() {
    this.disconnected = true;
  }

  takeRecords() {
    return [];
  }

  deliver() {
    if (this.disconnected) return;

    const [top = 0, right = 0, bottom = 0, left = 0] = (
      this.options.rootMargin ?? '0px 0px 0px 0px'
    )
      .split(' ')
      .map((value) => parseFloat(value));
    const root = {
      top: -top,
      right: VIEWPORT.innerWidth + right,
      bottom: VIEWPORT.innerHeight + bottom,
      left: -left,
    };
    const intersection = intersect(intersect(elementBox, scrollerBox), root);
    const entry = {
      boundingClientRect: toRect(elementBox),
      intersectionRect: toRect(intersection),
      intersectionRatio: area(intersection) / area(elementBox),
      isIntersecting: area(intersection) > 0,
    } as IntersectionObserverEntry;

    this.callback([entry], this as unknown as IntersectionObserver);
  }
}

const positionObservers = () => MockIntersectionObserver.instances.slice(1);
const live = () => positionObservers().filter((o) => !o.disconnected);
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const globals = globalThis as Record<string, unknown>;
const originalIntersectionObserver = globals.IntersectionObserver;
const originalGetComputedStyle = globals.getComputedStyle;
let observer: PositionObserver | undefined;

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  globals.IntersectionObserver = MockIntersectionObserver;
  globals.getComputedStyle = (target: Element) => {
    const overflow = target === scroller ? 'hidden' : 'visible';

    return {overflow, overflowX: overflow, overflowY: overflow};
  };
});

afterEach(() => {
  observer?.disconnect();
  observer = undefined;
  globals.IntersectionObserver = originalIntersectionObserver;
  globals.getComputedStyle = originalGetComputedStyle;
});

async function observe(box: Box) {
  elementBox = box;
  const callback = mock(() => {});
  observer = new PositionObserver(element, callback);
  // Let the initial entries of the visibility and position observers through.
  await wait(THROTTLE_INTERVAL * 2);

  return callback;
}

describe('PositionObserver', () => {
  it('stops observing an element fully in view that does not move', async () => {
    await observe({top: 20, right: 120, bottom: 70, left: 20});
    await wait(THROTTLE_INTERVAL * 6);

    expect(positionObservers()).toHaveLength(1);
  });

  it('stops observing an element clipped by an ancestor that does not move', async () => {
    // Half of the element is past the right edge of the scroller.
    await observe({top: 20, right: 400, bottom: 70, left: 200});
    await wait(THROTTLE_INTERVAL * 6);

    expect(positionObservers()).toHaveLength(1);
  });

  it('observes a clipped element again when it moves, and reports where it is', async () => {
    const callback = await observe({
      top: 20,
      right: 400,
      bottom: 70,
      left: 200,
    });

    elementBox = {top: 20, right: 440, bottom: 70, left: 240};
    live()[0]?.deliver();
    await wait(THROTTLE_INTERVAL * 2);

    expect(positionObservers()).toHaveLength(2);
    expect(callback).toHaveBeenLastCalledWith(toRect(elementBox));
  });

  it('observes an element again when it moved before its initial entry', async () => {
    elementBox = {top: 20, right: 400, bottom: 70, left: 200};
    observer = new PositionObserver(
      element,
      mock(() => {})
    );
    // The visibility observer's initial entry has the element measured.
    await Promise.resolve();
    expect(positionObservers()).toHaveLength(1);
    elementBox = {top: 20, right: 380, bottom: 70, left: 180};
    await wait(THROTTLE_INTERVAL * 6);

    expect(positionObservers()).toHaveLength(2);
  });

  it('keeps observing an element clipped on both sides of an axis', async () => {
    // Wider than the scroller, on both sides: it may move unseen.
    await observe({top: 20, right: 500, bottom: 70, left: -200});
    await wait(THROTTLE_INTERVAL * 6);

    expect(positionObservers().length).toBeGreaterThan(3);
  });
});
