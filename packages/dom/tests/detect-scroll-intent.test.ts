import {describe, expect, it, mock} from 'bun:test';
import {Rectangle} from '@dnd-kit/geometry';

import {
  detectScrollIntent,
  ScrollDirection,
} from '../src/utilities/scroll/detectScrollIntent.ts';

const element = {} as Element;
const rect = new Rectangle(0, 0, 100, 100);

const edgeCases = [
  {name: 'top', axis: 'y', direction: ScrollDirection.Reverse},
  {name: 'bottom', axis: 'y', direction: ScrollDirection.Forward},
  {name: 'left', axis: 'x', direction: ScrollDirection.Reverse},
  {name: 'right', axis: 'x', direction: ScrollDirection.Forward},
];

const getScrollPosition = mock(() => ({
  rect,
  isTop: false,
  isLeft: false,
  isBottom: false,
  isRight: false,
}));
const parseTransform = mock(() => ({x: 0, y: 0, scaleX: 1, scaleY: 1}));

mock.module('../src/utilities/scroll/getScrollPosition.ts', () => ({
  getScrollPosition,
}));
mock.module('../src/utilities/frame/getFrameTransform.ts', () => ({
  getFrameTransform: () => ({x: 0, y: 0, scaleX: 1, scaleY: 1}),
}));
mock.module('../src/utilities/styles/getComputedStyles.ts', () => ({
  getComputedStyles: () => ({transform: 'none'}),
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

      const atEdge = detectScrollIntent(element, edge);
      expect(atEdge.direction).toEqual({
        x: ScrollDirection.Idle,
        y: ScrollDirection.Idle,
        [axis]: direction,
      });
      expect(atEdge.speed).toEqual({x: 0, y: 0, [axis]: 25});

      const halfwayToEdge = detectScrollIntent(element, midpoint);
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
      rect,
      isTop: false,
      isLeft: false,
      isBottom: true,
      isRight: false,
    });

    const {direction, speed} = detectScrollIntent(element, {x: 50, y: 100});
    expect(direction).toEqual({
      x: ScrollDirection.Idle,
      y: ScrollDirection.Idle,
    });
    expect(speed).toEqual({x: 0, y: 0});
  });

  it('stays idle in the central dead zone', () => {
    const {direction, speed} = detectScrollIntent(element, {x: 50, y: 50});
    expect(direction).toEqual({
      x: ScrollDirection.Idle,
      y: ScrollDirection.Idle,
    });
    expect(speed).toEqual({x: 0, y: 0});
  });

  it('customizes scroll speed with the acceleration option', () => {
    const {direction, speed} = detectScrollIntent(
      element,
      {x: 50, y: 0},
      undefined,
      50
    );
    expect(direction.y).toBe(ScrollDirection.Reverse);
    expect(speed.y).toBe(50);
  });

  it('customizes the activation zone with the threshold option', () => {
    const pointer = {x: 50, y: 30};

    const narrow = detectScrollIntent(element, pointer);
    expect(narrow.direction.y).toBe(ScrollDirection.Idle);

    const wide = detectScrollIntent(element, pointer, undefined, undefined, {
      x: 0.5,
      y: 0.5,
    });
    expect(wide.direction.y).toBe(ScrollDirection.Reverse);
    expect(wide.speed.y).toBe(10);
  });

  it('customizes the cross-axis tolerance with the tolerance option', () => {
    const coordinates = {x: 105, y: 0};

    const withinTolerance = detectScrollIntent(element, coordinates);
    expect(withinTolerance.direction.y).toBe(ScrollDirection.Reverse);

    const outsideTolerance = detectScrollIntent(
      element,
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
      element,
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
    const {direction, speed} = detectScrollIntent(element, {x: 0, y: 0});
    expect(direction.x).toBe(ScrollDirection.Forward);
    expect(direction.y).toBe(ScrollDirection.Forward);
    expect(speed.x).toBe(25);
    expect(speed.y).toBe(25);
  });
});
