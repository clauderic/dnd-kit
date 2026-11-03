import {describe, expect, it} from 'bun:test';

import {isTableElement} from '../src/core/plugins/feedback/utilities.ts';

describe('isTableElement', () => {
  it('returns true for internal table elements', () => {
    for (const tagName of ['TR', 'TD', 'TH', 'THEAD', 'TBODY', 'TFOOT']) {
      expect(isTableElement({tagName} as Element)).toBe(true);
    }
  });

  it('returns false for non-table elements', () => {
    for (const tagName of ['TABLE', 'DIV', 'SPAN', 'CAPTION', 'BUTTON']) {
      expect(isTableElement({tagName} as Element)).toBe(false);
    }
  });
});
