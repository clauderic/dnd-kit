import {describe, expect, it} from 'bun:test';
import {spawnSync} from 'node:child_process';

describe('@dnd-kit/dom/modifiers', () => {
  it('can be imported in DOM-like environments without ResizeObserver', () => {
    const script = `
      globalThis.window = {document: {createElement() { return {}; }}};
      globalThis.document = globalThis.window.document;
      delete globalThis.ResizeObserver;

      await import('@dnd-kit/dom/modifiers');
    `;

    const result = spawnSync(process.execPath, ['--eval', script], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });

    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });
});
