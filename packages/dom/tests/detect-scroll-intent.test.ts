import {describe, expect, it, mock} from 'bun:test';
import {Rectangle} from '@dnd-kit/geometry';

import {
  detectScrollIntent,
  ScrollDirection,
  type ScrollIntentDetectorContext,
} from '../src/utilities/scroll/detectScrollIntent.ts';

const defaultContext: ScrollIntentDetectorContext = {
  element: {} as Element,
  pointer: {x: 50, y: 50},
  scrollPosition: {
    rect: new Rectangle(0, 0, 100, 100),
    position: {current: {x: 50, y: 50}, max: {x: 100, y: 100}},
    isTop: false,
    isLeft: false,
    isBottom: false,
    isRight: false,
  },
  inverted: {x: false, y: false},
};

const edgeCases = [
  {name: 'top', axis: 'y', direction: ScrollDirection.Reverse},
  {name: 'bottom', axis: 'y', direction: ScrollDirection.Forward},
  {name: 'left', axis: 'x', direction: ScrollDirection.Reverse},
  {name: 'right', axis: 'x', direction: ScrollDirection.Forward},
];

const getScrollPosition = mock(() => defaultContext.scrollPosition);
const parseTransform = mock(() => ({x: 0, y: 0, scaleX: 1, scaleY: 1}));

mock.module('../src/utilities/scroll/getScrollPosition.ts', () => ({
  getScrollPosition,
}));
mock.module('../src/utilities/frame/getFrameTransform.ts', () => ({
  getFrameTransform: () => ({x: 0, y: 0, scaleX: 1, scaleY: 1}),
}));
mock.module('../src/utilities/styles/getComputedStyles.ts', () => ({
  getComputedStyles: () => ({}),
}));
mock.module('../src/utilities/transform/parseTransform.ts', () => ({
  parseTransform,
}));

describe('detectScrollIntent', () => {
  it.each(edgeCases)(
    'scrolls toward the $name edge with speed increasing linearly',
    ({axis, direction}) => {
      const reverse = direction === ScrollDirection.Reverse;
      const edge = {x: 50, y: 50, [axis]: reverse ? 0 : 100};
      const midpoint = {x: 50, y: 50, [axis]: reverse ? 10 : 90};

      const atEdge = detectScrollIntent({...defaultContext, pointer: edge});
      expect(atEdge.direction).toEqual({
        x: ScrollDirection.Idle,
        y: ScrollDirection.Idle,
        [axis]: direction,
      });
      expect(atEdge.speed).toEqual({x: 0, y: 0, [axis]: 25});

      const halfwayToEdge = detectScrollIntent({
        ...defaultContext,
        pointer: midpoint,
      });
      expect(halfwayToEdge.direction).toEqual({
        x: ScrollDirection.Idle,
        y: ScrollDirection.Idle,
        [axis]: direction,
      });
      expect(halfwayToEdge.speed).toEqual({x: 0, y: 0, [axis]: 12.5});
    }
  );

  it('stays idle at the bottom edge when the container cannot scroll further', () => {
    const {direction, speed} = detectScrollIntent({
      ...defaultContext,
      pointer: {x: 50, y: 100},
      scrollPosition: {...defaultContext.scrollPosition, isBottom: true},
    });
    expect(direction).toEqual({
      x: ScrollDirection.Idle,
      y: ScrollDirection.Idle,
    });
    expect(speed).toEqual({x: 0, y: 0});
  });

  it('stays idle in the central dead zone', () => {
    const {direction, speed} = detectScrollIntent({
      ...defaultContext,
      pointer: {x: 50, y: 50},
    });
    expect(direction).toEqual({
      x: ScrollDirection.Idle,
      y: ScrollDirection.Idle,
    });
    expect(speed).toEqual({x: 0, y: 0});
  });

  it('customizes scroll speed with the acceleration option', () => {
    const {direction, speed} = detectScrollIntent(
      {...defaultContext, pointer: {x: 50, y: 0}},
      {acceleration: 50}
    );
    expect(direction.y).toBe(ScrollDirection.Reverse);
    expect(speed.y).toBe(50);
  });

  it('customizes the activation zone with the threshold option', () => {
    const pointer = {x: 50, y: 30};

    const narrow = detectScrollIntent({...defaultContext, pointer});
    expect(narrow.direction.y).toBe(ScrollDirection.Idle);

    const wide = detectScrollIntent(
      {...defaultContext, pointer},
      {threshold: {x: 0.5, y: 0.5}}
    );
    expect(wide.direction.y).toBe(ScrollDirection.Reverse);
    expect(wide.speed.y).toBe(10);
  });

  it('customizes the cross-axis tolerance with the tolerance option', () => {
    const pointer = {x: 105, y: 0};

    const withinTolerance = detectScrollIntent({...defaultContext, pointer});
    expect(withinTolerance.direction.y).toBe(ScrollDirection.Reverse);

    const outsideTolerance = detectScrollIntent(
      {...defaultContext, pointer},
      {tolerance: {x: 0, y: 0}}
    );
    expect(outsideTolerance.direction.y).toBe(ScrollDirection.Idle);
  });

  it('ignores the top edge when it opposes the intended scroll direction', () => {
    const {direction, speed} = detectScrollIntent({
      ...defaultContext,
      pointer: {x: 50, y: 0},
      requestedDirection: {x: ScrollDirection.Idle, y: ScrollDirection.Forward},
    });
    expect(direction).toEqual({
      x: ScrollDirection.Idle,
      y: ScrollDirection.Idle,
    });
    expect(speed).toEqual({x: 0, y: 0});
  });

  it('reverses scroll direction on inverted axes', () => {
    const {direction, speed} = detectScrollIntent({
      ...defaultContext,
      pointer: {x: 0, y: 0},
      inverted: {x: true, y: true},
    });
    expect(direction.x).toBe(ScrollDirection.Forward);
    expect(direction.y).toBe(ScrollDirection.Forward);
    expect(speed.x).toBe(25);
    expect(speed.y).toBe(25);
  });

  describe('legacy signature', () => {
    it.each(edgeCases)(
      'scrolls toward the $name edge with speed increasing linearly',
      ({axis, direction}) => {
        const reverse = direction === ScrollDirection.Reverse;
        const edge = {x: 50, y: 50, [axis]: reverse ? 0 : 100};
        const midpoint = {x: 50, y: 50, [axis]: reverse ? 10 : 90};

        const atEdge = detectScrollIntent(defaultContext.element, edge);
        expect(atEdge.direction).toEqual({
          x: ScrollDirection.Idle,
          y: ScrollDirection.Idle,
          [axis]: direction,
        });
        expect(atEdge.speed).toEqual({x: 0, y: 0, [axis]: 25});

        const halfwayToEdge = detectScrollIntent(
          defaultContext.element,
          midpoint
        );
        expect(halfwayToEdge.direction).toEqual({
          x: ScrollDirection.Idle,
          y: ScrollDirection.Idle,
          [axis]: direction,
        });
        expect(halfwayToEdge.speed).toEqual({x: 0, y: 0, [axis]: 12.5});
      }
    );

    it('stays idle at the bottom edge when the container cannot scroll further', () => {
      getScrollPosition.mockReturnValueOnce({
        ...defaultContext.scrollPosition,
        isBottom: true,
      });
      const {direction, speed} = detectScrollIntent(defaultContext.element, {
        x: 50,
        y: 100,
      });
      expect(direction).toEqual({
        x: ScrollDirection.Idle,
        y: ScrollDirection.Idle,
      });
      expect(speed).toEqual({x: 0, y: 0});
    });

    it('stays idle in the central dead zone', () => {
      const {direction, speed} = detectScrollIntent(defaultContext.element, {
        x: 50,
        y: 50,
      });
      expect(direction).toEqual({
        x: ScrollDirection.Idle,
        y: ScrollDirection.Idle,
      });
      expect(speed).toEqual({x: 0, y: 0});
    });

    it('customizes scroll speed with the acceleration option', () => {
      const {direction, speed} = detectScrollIntent(
        defaultContext.element,
        {x: 50, y: 0},
        undefined,
        50
      );
      expect(direction.y).toBe(ScrollDirection.Reverse);
      expect(speed.y).toBe(50);
    });

    it('customizes the activation zone with the threshold option', () => {
      const pointer = {x: 50, y: 30};

      const narrow = detectScrollIntent(defaultContext.element, pointer);
      expect(narrow.direction.y).toBe(ScrollDirection.Idle);

      const wide = detectScrollIntent(
        defaultContext.element,
        pointer,
        undefined,
        undefined,
        {
          x: 0.5,
          y: 0.5,
        }
      );
      expect(wide.direction.y).toBe(ScrollDirection.Reverse);
      expect(wide.speed.y).toBe(10);
    });

    it('customizes the cross-axis tolerance with the tolerance option', () => {
      const coordinates = {x: 105, y: 0};

      const withinTolerance = detectScrollIntent(
        defaultContext.element,
        coordinates
      );
      expect(withinTolerance.direction.y).toBe(ScrollDirection.Reverse);

      const outsideTolerance = detectScrollIntent(
        defaultContext.element,
        coordinates,
        undefined,
        undefined,
        undefined,
        {x: 0, y: 0}
      );
      expect(outsideTolerance.direction.y).toBe(ScrollDirection.Idle);
    });

    it('ignores the top edge when it opposes the intended scroll direction', () => {
      const {direction, speed} = detectScrollIntent(
        defaultContext.element,
        {x: 50, y: 0},
        {x: ScrollDirection.Idle, y: ScrollDirection.Forward}
      );
      expect(direction).toEqual({
        x: ScrollDirection.Idle,
        y: ScrollDirection.Idle,
      });
      expect(speed).toEqual({x: 0, y: 0});
    });

    it('reverses scroll direction on inverted axes', () => {
      parseTransform.mockReturnValueOnce({x: 0, y: 0, scaleX: -1, scaleY: -1});
      const {direction, speed} = detectScrollIntent(defaultContext.element, {
        x: 0,
        y: 0,
      });
      expect(direction.x).toBe(ScrollDirection.Forward);
      expect(direction.y).toBe(ScrollDirection.Forward);
      expect(speed.x).toBe(25);
      expect(speed.y).toBe(25);
    });
  });
});
