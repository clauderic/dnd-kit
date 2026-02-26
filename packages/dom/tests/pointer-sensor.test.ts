import {describe, expect, it, jest} from 'bun:test';
import {ActivationController} from '@dnd-kit/abstract';

import {DelayConstraint} from '../src/core/sensors/pointer/DelayConstraint.ts';

function createPointerEvent(
  type: string,
  options: Partial<PointerEvent> = {}
): PointerEvent {
  return {
    type,
    pointerId: 1,
    clientX: 0,
    clientY: 0,
    ...options,
  } as unknown as PointerEvent;
}

describe('ActivationController with DelayConstraint', () => {
  it('should activate after the delay elapses', async () => {
    const onActivate = jest.fn();
    const constraint = new DelayConstraint({value: 50, tolerance: 5});
    const controller = new ActivationController([constraint], onActivate);

    controller.onEvent(createPointerEvent('pointerdown'));

    expect(onActivate).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 80));

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('should cancel pending activation when the controller is aborted', async () => {
    const onActivate = jest.fn();
    const constraint = new DelayConstraint({value: 50, tolerance: 5});
    const controller = new ActivationController([constraint], onActivate);

    controller.onEvent(createPointerEvent('pointerdown'));

    expect(onActivate).not.toHaveBeenCalled();

    controller.abort();

    await new Promise((resolve) => setTimeout(resolve, 80));

    expect(onActivate).not.toHaveBeenCalled();
    expect(controller.signal.aborted).toBe(true);
  });

  it('should not activate if aborted just before the delay elapses', async () => {
    const onActivate = jest.fn();
    const constraint = new DelayConstraint({value: 50, tolerance: 5});
    const controller = new ActivationController([constraint], onActivate);

    controller.onEvent(createPointerEvent('pointerdown'));

    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(onActivate).not.toHaveBeenCalled();

    controller.abort();

    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('should cancel activation when pointerup arrives before the delay', async () => {
    const onActivate = jest.fn();
    const constraint = new DelayConstraint({value: 100, tolerance: 5});
    const controller = new ActivationController([constraint], onActivate);

    controller.onEvent(createPointerEvent('pointerdown'));
    controller.onEvent(createPointerEvent('pointerup'));

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(onActivate).not.toHaveBeenCalled();
  });
});
