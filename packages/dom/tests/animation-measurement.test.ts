import {afterEach, beforeEach, describe, expect, it} from 'bun:test';
import {forceFinishAnimations} from '../src/utilities/animations/forceFinishAnimations.ts';

const keyframeEffect = Object.getOwnPropertyDescriptor(
  globalThis,
  'KeyframeEffect'
);
class Effect {
  constructor(public target: Element) {}
  getKeyframes() {
    return [{translate: '100px 0'}, {translate: '0px 0'}];
  }
  getComputedTiming() {
    return {duration: 200};
  }
}
beforeEach(() =>
  Object.defineProperty(globalThis, 'KeyframeEffect', {
    configurable: true,
    value: Effect,
  })
);
afterEach(() => {
  if (keyframeEffect)
    Object.defineProperty(globalThis, 'KeyframeEffect', keyframeEffect);
  else Reflect.deleteProperty(globalThis, 'KeyframeEffect');
});

function setup() {
  const animations: Animation[] = [];
  const element = {
    ownerDocument: {getAnimations: () => [...animations]},
  } as unknown as Element;
  return {
    measure: () => forceFinishAnimations(element, {properties: ['translate']}),
    animate(pending: boolean) {
      const animation = {
        effect: new Effect(element),
        currentTime: 0,
        pending,
        playState: 'running',
      } as unknown as Animation;
      animations.push(animation);
      return animation;
    },
  };
}

describe('animation measurement', () => {
  it('includes an animation started after an earlier measurement in the same turn', () => {
    const fixture = setup();
    fixture.measure()?.();
    const animation = fixture.animate(false);
    animation.currentTime = 25;
    const restore = fixture.measure();
    expect(animation.currentTime).toBe(200);
    restore?.();
    expect(animation.currentTime).toBe(25);
  });

  it('projects and restores a newly pending animation without waiting for a frame', () => {
    const fixture = setup();
    const animation = fixture.animate(true);
    const restore = fixture.measure();
    expect(animation.currentTime).toBe(200);
    restore?.();
    expect(animation.currentTime).toBe(0);
  });
});
