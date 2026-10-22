import {expect, test} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {build} from 'vite';
import type {} from './fixtures/feedback-drop.ts';

let fixture: string;
test.beforeAll(async () => {
  // Bundle the fixture for both static CI hosting and the development server.
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      minify: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/feedback-drop.ts', import.meta.url)
        ),
        name: 'feedbackDropFixture',
        formats: ['iife'],
      },
    },
  });
  const bundle = Array.isArray(result) ? result[0] : result;
  if (!('output' in bundle)) throw new Error('Expected a fixture bundle');
  const chunk = bundle.output.find((output) => output.type === 'chunk');
  if (!chunk) throw new Error('Missing fixture bundle');
  fixture = chunk.code;
});

for (const change of ['remove', 'reparent'] as const) {
  test(`${change} source on drop releases its old layout slot before the next frame`, async ({
    page,
  }) => {
    await page.goto('about:blank');
    await page.addScriptTag({content: fixture});
    const result = await page.evaluate(async (change) => {
      const {DragDropManager, Draggable, Feedback} = window.feedbackDropFixture;
      const manager = new DragDropManager({plugins: [Feedback], sensors: []});
      const stack = document.createElement('div');
      stack.style.cssText = 'display: grid; grid-auto-rows: 20px; width: 100px';
      const covered = document.createElement('div');
      const element = document.createElement('div');
      element.style.cssText = 'width: 100px; height: 100px';
      stack.append(covered, element);
      const destination = document.createElement('div');
      destination.style.cssText = 'position: absolute; left: 200px; top: 0';
      document.body.append(stack, destination);
      const source = new Draggable({id: 'card', element}, manager);
      source.register();
      const frame = () => new Promise(requestAnimationFrame);
      try {
        manager.actions.start({source, coordinates: {x: 10, y: 30}});
        await frame();
        manager.actions.move({by: {x: 100, y: 0}});
        await frame();
        const hadPlaceholder = !!stack.querySelector('[data-dnd-placeholder]');
        manager.monitor.addEventListener('dragend', () => {
          if (change === 'remove') element.remove();
          else destination.append(element);
          // React replaces the face-down component with a newly revealed card.
          covered.remove();
          const revealed = document.createElement('div');
          revealed.textContent = '7 of diamonds';
          stack.append(revealed);
        });
        manager.actions.stop();
        await frame();
        const revealed = stack.lastElementChild!;
        const dropping = source.status === 'dropping';
        const destinationPlaceholders = destination.querySelectorAll(
          '[data-dnd-placeholder]'
        ).length;
        const revealedOffset =
          revealed.getBoundingClientRect().top -
          stack.getBoundingClientRect().top;
        const placeholders = stack.querySelectorAll(
          '[data-dnd-placeholder]'
        ).length;
        // A connected source must still finish its normal drop animation.
        await new Promise((resolve) => setTimeout(resolve, 350));
        return {
          dropping,
          destinationPlaceholders,
          settled:
            source.status === 'idle' &&
            !document.querySelector('[data-dnd-placeholder]'),
          hadPlaceholder,
          placeholders,
          revealedOffset,
        };
      } finally {
        manager.destroy();
        source.destroy();
        stack.remove();
        destination.remove();
      }
    }, change);
    expect(result.dropping).toBe(change === 'reparent');
    expect(result.destinationPlaceholders).toBe(change === 'reparent' ? 1 : 0);
    expect(result.settled).toBe(true);
    expect(result.hadPlaceholder).toBe(true);
    expect(result.placeholders).toBe(0);
    expect(result.revealedOffset).toBe(0);
  });
}
