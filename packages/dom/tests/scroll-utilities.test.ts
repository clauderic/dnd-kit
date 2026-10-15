import {afterEach, beforeEach, describe, expect, it, mock} from 'bun:test';

import {
  canScroll,
  detectScrollIntent,
  getScrollPosition,
  ScrollDirection,
} from '@dnd-kit/dom/utilities';

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');

beforeEach(() => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      frameElement: null,
      getComputedStyle: () => ({transform: 'none'}),
    },
  });
});

afterEach(() => {
  if (originalWindow) {
    Object.defineProperty(globalThis, 'window', originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, 'window');
  }
});

function createScrollableElement() {
  const getBoundingClientRect = mock(() => ({
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
  }));
  const element = {
    ownerDocument: {defaultView: window},
    clientHeight: 100,
    clientWidth: 100,
    scrollHeight: 500,
    scrollWidth: 500,
    scrollTop: 100,
    scrollLeft: 100,
    getBoundingClientRect,
  } as unknown as Element;

  return {element, getBoundingClientRect};
}

describe('scroll utilities', () => {
  it('keeps the displacement as the second canScroll argument', () => {
    const {element} = createScrollableElement();
    element.scrollTop = 390;

    expect(canScroll(element, {x: 0, y: 5}).bottom).toBe(true);
    expect(canScroll(element, {x: 0, y: 20}).bottom).toBe(false);
    expect(canScroll(element, {x: 0, y: -400}).top).toBe(false);
  });

  it('computes the scroll position when optional arguments are omitted', () => {
    const {element, getBoundingClientRect} = createScrollableElement();

    expect(canScroll(element)).toMatchObject({x: true, y: true});
    expect(detectScrollIntent(element, {x: 50, y: 95})).toEqual({
      direction: {x: ScrollDirection.Idle, y: ScrollDirection.Forward},
      speed: {x: 0, y: 18.75},
    });
    expect(getBoundingClientRect).toHaveBeenCalledTimes(2);
  });

  it('keeps directional intent as the third detectScrollIntent argument', () => {
    const {element} = createScrollableElement();
    const result = detectScrollIntent(
      element,
      {x: 50, y: 95},
      {x: ScrollDirection.Idle, y: ScrollDirection.Reverse}
    );

    expect(result).toEqual({
      direction: {x: ScrollDirection.Idle, y: ScrollDirection.Idle},
      speed: {x: 0, y: 0},
    });
  });

  it('preserves acceleration, threshold, and tolerance argument positions', () => {
    const {element} = createScrollableElement();
    const result = detectScrollIntent(
      element,
      {x: 101, y: 95},
      undefined,
      40,
      {x: 0.1, y: 0.1},
      {x: 2, y: 3}
    );

    expect(result.direction.y).toBe(ScrollDirection.Forward);
    expect(result.speed.y).toBe(20);
    expect(
      detectScrollIntent(
        element,
        {x: 103, y: 95},
        undefined,
        40,
        {x: 0.1, y: 0.1},
        {x: 2, y: 3}
      ).speed.y
    ).toBe(0);
  });

  it('shares one measurement between the helpers when a position is supplied', () => {
    const {element, getBoundingClientRect} = createScrollableElement();
    const scrollPosition = getScrollPosition(element);

    expect(canScroll(element, {x: 0, y: 5}, scrollPosition).bottom).toBe(true);
    expect(
      detectScrollIntent(
        element,
        {x: 50, y: 95},
        undefined,
        undefined,
        undefined,
        undefined,
        scrollPosition
      )
    ).toEqual({
      direction: {x: ScrollDirection.Idle, y: ScrollDirection.Forward},
      speed: {x: 0, y: 18.75},
    });
    expect(getBoundingClientRect).toHaveBeenCalledTimes(1);
  });
});
