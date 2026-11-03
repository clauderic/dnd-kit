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

for (const scenario of [
  'reattach',
  'replace with new handle',
  'focus another control',
  'pointer input',
  'keyboard input',
  'new drag',
  'destroy plugin',
  'timeout',
  'pointer drag',
  'reduced motion',
] as const) {
  test(`detached drop focus: ${scenario}`, async ({page}) => {
    if (scenario === 'reduced motion') {
      await page.emulateMedia({reducedMotion: 'reduce'});
    }
    await page.goto('about:blank');
    await page.addScriptTag({content: fixture});
    const result = await page.evaluate(async (scenario) => {
      const {DragDropManager, Draggable, Feedback} = window.feedbackDropFixture;
      const manager = new DragDropManager({
        plugins: [
          Feedback.configure({
            dropAnimation: {duration: scenario === 'timeout' ? 80 : 1000},
            keyboardTransition: null,
          }),
        ],
        sensors: [],
      });
      const host = document.createElement('div');
      const element = document.createElement('button');
      element.textContent = 'Dragged card';
      element.style.cssText = 'width: 100px; height: 100px';
      const other = document.createElement('button');
      other.textContent = 'Another control';
      host.append(element, other);
      document.body.append(host);
      const source = new Draggable({id: 'card', element}, manager);
      source.register();
      const extraSources: InstanceType<typeof Draggable>[] = [];
      const frame = () => new Promise(requestAnimationFrame);
      const feedback = manager.plugins.find(
        (plugin) => plugin instanceof Feedback
      )!;
      let target: HTMLElement = element;
      try {
        element.focus();
        manager.actions.start({
          source,
          coordinates: {x: 50, y: 50},
          event:
            scenario === 'pointer drag'
              ? new PointerEvent('pointerdown')
              : new KeyboardEvent('keydown', {key: 'Enter'}),
        });
        await frame();
        manager.actions.move({by: {x: 100, y: 0}});
        await frame();
        manager.monitor.addEventListener('dragend', () => element.remove());
        manager.actions.stop();
        await frame();
        const releasedImmediately =
          source.status === 'idle' &&
          !host.querySelector('[data-dnd-placeholder]');

        if (scenario === 'focus another control') other.focus();
        if (scenario === 'pointer input') {
          document.body.dispatchEvent(
            new PointerEvent('pointerdown', {bubbles: true})
          );
        }
        if (scenario === 'keyboard input') {
          document.body.dispatchEvent(
            new KeyboardEvent('keydown', {key: 'Tab', bubbles: true})
          );
        }
        if (scenario === 'new drag') {
          const next = new Draggable({id: 'next', element: other}, manager);
          next.register();
          extraSources.push(next);
          // Do not focus the new source: this checks drag cancellation separately
          // from the focusin and input-event cancellation paths.
          manager.actions.start({source: next, coordinates: {x: 50, y: 150}});
        }
        if (scenario === 'destroy plugin') feedback.destroy();
        if (scenario === 'timeout') {
          // Returning after the configured animation window must not steal focus.
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
        await frame();
        if (scenario === 'replace with new handle') {
          source.unregister();
          const replacement = document.createElement('div');
          target = document.createElement('button');
          target.textContent = 'Replacement handle';
          replacement.append(target);
          host.append(replacement);
          const next = new Draggable(
            {id: 'card', element: replacement, handle: target},
            manager
          );
          next.register();
          extraSources.push(next);
        } else {
          host.append(element);
        }
        await frame();
        await frame();
        return {
          releasedImmediately,
          targetFocused: document.activeElement === target,
          otherFocused: document.activeElement === other,
          focusedBody: document.activeElement === document.body,
        };
      } finally {
        manager.destroy();
        source.destroy();
        extraSources.forEach((source) => source.destroy());
        host.remove();
      }
    }, scenario);
    expect(result.releasedImmediately).toBe(true);
    expect(result.targetFocused).toBe(
      scenario === 'reattach' || scenario === 'replace with new handle'
    );
    if (scenario === 'focus another control')
      expect(result.otherFocused).toBe(true);
    else if (
      scenario !== 'reattach' &&
      scenario !== 'replace with new handle'
    ) {
      expect(result.focusedBody).toBe(true);
    }
  });
}

test('suspending an asynchronous drop waits for reparenting and preserves the animation', async ({
  page,
}) => {
  await page.goto('about:blank');
  await page.addScriptTag({content: fixture});
  const result = await page.evaluate(async () => {
    const {DragDropManager, Draggable, Feedback} = window.feedbackDropFixture;
    const manager = new DragDropManager({
      plugins: [
        Feedback.configure({
          dropAnimation: {duration: 200},
          keyboardTransition: null,
        }),
      ],
      sensors: [],
    });
    const host = document.createElement('div');
    const destination = document.createElement('div');
    const element = document.createElement('button');
    element.style.cssText = 'width: 100px; height: 100px';
    element.textContent = 'Card';
    host.append(element);
    document.body.append(host, destination);
    const source = new Draggable({id: 'card', element}, manager);
    source.register();
    const frame = () => new Promise(requestAnimationFrame);
    let resume: (() => void) | undefined;
    try {
      element.focus();
      manager.actions.start({
        source,
        coordinates: {x: 50, y: 50},
        event: new KeyboardEvent('keydown', {key: 'Enter'}),
      });
      await frame();
      manager.actions.move({by: {x: 100, y: 0}});
      await frame();
      manager.monitor.addEventListener('dragend', (event) => {
        resume = event.suspend().resume;
        element.remove();
      });
      manager.actions.stop();
      await frame();
      await frame();
      const suspended =
        !manager.dragOperation.status.idle &&
        !!host.querySelector('[data-dnd-placeholder]');
      destination.append(element);
      resume!();
      await frame();
      const animatingAfterResume =
        source.status === 'dropping' &&
        !!destination.querySelector('[data-dnd-placeholder]') &&
        element.getAnimations().length > 0;
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        suspended,
        animatingAfterResume,
        settled:
          source.status === 'idle' &&
          !destination.querySelector('[data-dnd-placeholder]'),
        focused: document.activeElement === element,
      };
    } finally {
      manager.destroy();
      source.destroy();
      host.remove();
      destination.remove();
    }
  });
  expect(result).toEqual({
    suspended: true,
    animatingAfterResume: true,
    settled: true,
    focused: true,
  });
});

test('a custom animation finishing after plugin destruction cannot restore focus', async ({
  page,
}) => {
  await page.goto('about:blank');
  await page.addScriptTag({content: fixture});
  const result = await page.evaluate(async () => {
    const {DragDropManager, Draggable, Feedback} = window.feedbackDropFixture;
    let finishAnimation: (() => void) | undefined;
    const manager = new DragDropManager({
      plugins: [
        Feedback.configure({
          dropAnimation: () =>
            new Promise<void>((resolve) => {
              finishAnimation = resolve;
            }),
          keyboardTransition: null,
        }),
      ],
      sensors: [],
    });
    const host = document.createElement('div');
    const element = document.createElement('button');
    element.style.cssText = 'width: 100px; height: 100px';
    element.textContent = 'Card';
    host.append(element);
    document.body.append(host);
    const source = new Draggable({id: 'card', element}, manager);
    source.register();
    const frame = () => new Promise(requestAnimationFrame);
    try {
      element.focus();
      manager.actions.start({
        source,
        coordinates: {x: 50, y: 50},
        event: new KeyboardEvent('keydown', {key: 'Enter'}),
      });
      await frame();
      manager.actions.move({by: {x: 100, y: 0}});
      await frame();
      manager.monitor.addEventListener('dragend', () => element.remove());
      manager.actions.stop();
      await frame();
      const animationStarted = !!finishAnimation;
      // Keep the registered target available so a stale focus callback would be observable.
      manager.plugins.find((plugin) => plugin instanceof Feedback)!.destroy();
      host.append(element);
      finishAnimation!();
      await frame();
      await frame();
      return {
        animationStarted,
        focusedBody: document.activeElement === document.body,
      };
    } finally {
      manager.destroy();
      source.destroy();
      host.remove();
    }
  });
  expect(result).toEqual({animationStarted: true, focusedBody: true});
});

test('a short drop duration still restores a connected handle on the first frame', async ({
  page,
}) => {
  await page.goto('about:blank');
  await page.addScriptTag({content: fixture});
  const focused = await page.evaluate(async () => {
    const {DragDropManager, Draggable, Feedback} = window.feedbackDropFixture;
    const manager = new DragDropManager({
      plugins: [
        Feedback.configure({
          dropAnimation: {duration: 1},
          keyboardTransition: null,
        }),
      ],
      sensors: [],
    });
    const host = document.createElement('div');
    const element = document.createElement('button');
    element.style.cssText = 'width: 100px; height: 100px';
    element.textContent = 'Card';
    const handle = document.createElement('button');
    handle.textContent = 'Persistent handle';
    host.append(element, handle);
    document.body.append(host);
    const source = new Draggable({id: 'card', element, handle}, manager);
    source.register();
    const frame = () => new Promise(requestAnimationFrame);
    try {
      element.focus();
      manager.actions.start({
        source,
        coordinates: {x: 50, y: 50},
        event: new KeyboardEvent('keydown', {key: 'Enter'}),
      });
      await frame();
      manager.actions.move({by: {x: 100, y: 0}});
      await frame();
      manager.monitor.addEventListener('dragend', () => element.remove());
      manager.actions.stop();
      // Finish drop microtasks, then keep the first animation frame beyond the
      // 1 ms animation duration. A connected target must still get one attempt.
      for (let i = 0; i < 10; i++) await Promise.resolve();
      const until = performance.now() + 5;
      while (performance.now() < until) {}
      await frame();
      await frame();
      return document.activeElement === handle;
    } finally {
      manager.destroy();
      source.destroy();
      host.remove();
    }
  });
  expect(focused).toBe(true);
});
