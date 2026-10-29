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
    },
  });
  mockComputedStyles();
});

function mockComputedStyles(styles: Partial<CSSStyleDeclaration> = {}) {
  const getComputedStyle = mock(
    () =>
      ({
        transform: 'none',
        direction: 'ltr',
        writingMode: 'horizontal-tb',
        display: 'block',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        ...styles,
      }) as CSSStyleDeclaration
  );
  window.getComputedStyle = getComputedStyle;

  return getComputedStyle;
}

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
    expect(window.getComputedStyle).toHaveBeenCalledTimes(1);
  });

  it('treats [-max, 0] as the horizontal range in RTL containers', () => {
    mockComputedStyles({direction: 'rtl'});
    const {element} = createScrollableElement();
    element.scrollLeft = -400;

    const {position, isLeft, isRight} = getScrollPosition(element);
    expect(position.min.x).toBe(-400);
    expect(position.max.x).toBe(0);
    expect({isLeft, isRight}).toEqual({isLeft: true, isRight: false});
    expect(canScroll(element)).toMatchObject({left: false, right: true});

    element.scrollLeft = 0;
    expect(canScroll(element)).toMatchObject({left: true, right: false});
  });

  const horizontalRanges: {
    name: string;
    styles: Partial<CSSStyleDeclaration>;
    min: number;
    max: number;
  }[] = [
    {name: 'LTR blocks', styles: {}, min: 0, max: 400},
    {name: 'RTL blocks', styles: {direction: 'rtl'}, min: -400, max: 0},
    {
      name: 'RTL reversed flex rows',
      styles: {direction: 'rtl', display: 'flex', flexDirection: 'row-reverse'},
      min: 0,
      max: 400,
    },
    {
      name: 'LTR reversed inline-flex rows',
      styles: {display: 'inline-flex', flexDirection: 'row-reverse'},
      min: -400,
      max: 0,
    },
    {
      name: 'RTL reversed flex columns',
      styles: {
        direction: 'rtl',
        display: 'flex',
        flexDirection: 'column-reverse',
      },
      min: -400,
      max: 0,
    },
    {
      name: 'RTL vertical-lr blocks',
      styles: {direction: 'rtl', writingMode: 'vertical-lr'},
      min: 0,
      max: 400,
    },
    {
      name: 'LTR vertical-rl blocks',
      styles: {writingMode: 'vertical-rl'},
      min: -400,
      max: 0,
    },
    {
      name: 'RTL sideways-lr blocks',
      styles: {direction: 'rtl', writingMode: 'sideways-lr'},
      min: 0,
      max: 400,
    },
    {
      name: 'LTR sideways-rl blocks',
      styles: {writingMode: 'sideways-rl'},
      min: -400,
      max: 0,
    },
    {
      name: 'vertical-lr reversed flex columns',
      styles: {
        writingMode: 'vertical-lr',
        display: 'flex',
        flexDirection: 'column-reverse',
      },
      min: -400,
      max: 0,
    },
    {
      name: 'vertical-rl reversed flex columns',
      styles: {
        writingMode: 'vertical-rl',
        display: 'flex',
        flexDirection: 'column-reverse',
      },
      min: 0,
      max: 400,
    },
    {
      name: 'vertical-lr reversed flex rows',
      styles: {
        writingMode: 'vertical-lr',
        display: 'flex',
        flexDirection: 'row-reverse',
      },
      min: 0,
      max: 400,
    },
    {
      name: 'LTR flex columns with reversed wrapping',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap-reverse',
      },
      min: -400,
      max: 0,
    },
    {
      name: 'RTL flex columns with reversed wrapping',
      styles: {
        direction: 'rtl',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap-reverse',
      },
      min: 0,
      max: 400,
    },
    {
      name: 'vertical-rl flex rows with reversed wrapping',
      styles: {
        writingMode: 'vertical-rl',
        display: 'flex',
        flexWrap: 'wrap-reverse',
      },
      min: 0,
      max: 400,
    },
    {
      name: 'RTL blocks with unused flex properties',
      styles: {
        direction: 'rtl',
        flexDirection: 'row-reverse',
        flexWrap: 'wrap-reverse',
      },
      min: -400,
      max: 0,
    },
  ];

  for (const {name, styles, min, max} of horizontalRanges) {
    it(`uses the physical scroll edges for ${name}`, () => {
      mockComputedStyles(styles);
      const {element} = createScrollableElement();

      element.scrollLeft = min;
      expect(getScrollPosition(element)).toMatchObject({
        position: {min: {x: min}, max: {x: max}},
        isLeft: true,
        isRight: false,
      });
      expect(canScroll(element)).toMatchObject({left: false, right: true});
      expect(detectScrollIntent(element, {x: 5, y: 50}).direction.x).toBe(
        ScrollDirection.Idle
      );
      expect(detectScrollIntent(element, {x: 95, y: 50}).direction.x).toBe(
        ScrollDirection.Forward
      );

      element.scrollLeft = (min + max) / 2;
      expect(canScroll(element)).toMatchObject({left: true, right: true});
      expect(canScroll(element, {x: -201, y: 0}).left).toBe(false);
      expect(canScroll(element, {x: 201, y: 0}).right).toBe(false);

      element.scrollLeft = max;
      expect(getScrollPosition(element)).toMatchObject({
        isLeft: false,
        isRight: true,
      });
      expect(canScroll(element)).toMatchObject({left: true, right: false});
      expect(detectScrollIntent(element, {x: 5, y: 50}).direction.x).toBe(
        ScrollDirection.Reverse
      );
      expect(detectScrollIntent(element, {x: 95, y: 50}).direction.x).toBe(
        ScrollDirection.Idle
      );
    });
  }

  it('reuses cached styles without probing the scroll offset', () => {
    const getComputedStyle = mockComputedStyles({
      direction: 'rtl',
      display: 'flex',
      flexDirection: 'row-reverse',
    });
    const {element, getBoundingClientRect} = createScrollableElement();
    const setScrollLeft = mock();
    Object.defineProperty(element, 'scrollLeft', {
      get: () => 0,
      set: setScrollLeft,
    });

    for (let i = 0; i < 2; i++) {
      const scrollPosition = getScrollPosition(element);
      expect(canScroll(element, undefined, scrollPosition).right).toBe(true);
      expect(
        detectScrollIntent(
          element,
          {x: 95, y: 50},
          undefined,
          undefined,
          undefined,
          undefined,
          scrollPosition
        ).direction.x
      ).toBe(ScrollDirection.Forward);
    }

    expect(getComputedStyle).toHaveBeenCalledTimes(1);
    expect(getBoundingClientRect).toHaveBeenCalledTimes(2);
    expect(setScrollLeft).not.toHaveBeenCalled();
  });
});
