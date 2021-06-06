import type {Modifier, ViewRect} from '@dnd-kit/core';
import type {FirstArgument, Transform} from '@dnd-kit/utilities';

import {restrictToHorizontalAxis, restrictToVerticalAxis} from '../src';

describe('@dnd-kit/modifiers', () => {
  const defaultRect: ViewRect = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0,
    height: 0,
    offsetLeft: 0,
    offsetTop: 0,
  };
  const defaultTransform: Transform = {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  };
  const defaultArguments: FirstArgument<Modifier> = {
    active: null,
    over: null,
    transform: defaultTransform,
    activeNodeRect: defaultRect,
    containerNodeRect: defaultRect,
    draggingNodeRect: defaultRect,
    overlayNodeRect: defaultRect,
    windowRect: defaultRect,
    scrollableAncestors: [],
    scrollableAncestorRects: [],
  };

  it('restrictToHorizontalAxis', () => {
    const transform: Transform = {...defaultTransform, x: 20, y: 100};

    expect(
      restrictToHorizontalAxis({...defaultArguments, transform})
    ).toStrictEqual({
      ...transform,
      y: 0,
    });
  });

  it('restrictToVerticalAxis', () => {
    const transform: Transform = {...defaultTransform, x: 20, y: 100};

    expect(
      restrictToVerticalAxis({...defaultArguments, transform})
    ).toStrictEqual({
      ...transform,
      x: 0,
    });
  });
});
