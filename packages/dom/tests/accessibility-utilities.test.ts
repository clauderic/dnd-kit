import {describe, expect, it} from 'bun:test';

import {supportsPressedState} from '../src/core/plugins/accessibility/utilities.ts';

function createElement(role: string | null) {
  return {
    getAttribute: (name: string) => (name === 'role' ? role : null),
  } as Element;
}

describe('supportsPressedState', () => {
  it('allows aria-pressed on activators without a role', () => {
    expect(supportsPressedState(createElement(null))).toBe(true);
  });

  it('allows aria-pressed on activators with role="button"', () => {
    expect(supportsPressedState(createElement('button'))).toBe(true);
  });

  it('skips aria-pressed on activators with another role', () => {
    expect(supportsPressedState(createElement('tab'))).toBe(false);
    expect(supportsPressedState(createElement('option'))).toBe(false);
    expect(supportsPressedState(createElement('treeitem'))).toBe(false);
  });
});
