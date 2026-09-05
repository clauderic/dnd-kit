import {test, expect, type Page} from '@playwright/test';
import type {} from '../stories/react/Sortable/Nested/trace.ts';
import pointerPath from './fixtures/nested-collections-pointer-path.json' with {type: 'json'};
import headerPath from './fixtures/nested-collections-header-path.json' with {type: 'json'};
import containerPath from './fixtures/nested-collections-container-path.json' with {type: 'json'};

const node = (page: Page, id: string) =>
  page.locator(
    `[data-board-node="${id}"]:not([aria-hidden="true"], [aria-hidden="true"] *)`
  );

async function settle(page: Page, frames = 12) {
  await page.evaluate(async (frames) => {
    for (let i = 0; i < frames; i++) await new Promise(requestAnimationFrame);
  }, frames);
}

async function pickUp(page: Page, title: string) {
  const handle = page.getByRole('button', {name: `Drag ${title}`, exact: true});
  await handle.scrollIntoViewIfNeeded();
  const rect = (await handle.boundingBox())!;
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width / 2 + 8, rect.y + rect.height / 2);
  await expect(page.locator('[data-nested-board]')).toHaveAttribute(
    'data-dragging',
    'true'
  );
}

async function moveInside(page: Page, id: string) {
  const rect = (await page
    .locator(`[data-board-append="contents:${id}"]`)
    .boundingBox())!;
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await settle(page);
}

test.beforeEach(async ({page}) => {
  await page.goto(
    '/iframe.html?id=react-sortable-nested-collections--example&viewMode=story'
  );
  await expect(
    page.getByRole('heading', {name: 'Good things take shape.'})
  ).toBeVisible();
});

test('a deeply nested card transfers into an empty collection and stays there with a stationary pointer', async ({
  page,
}) => {
  await pickUp(page, 'Give buttons some love');
  await moveInside(page, 'someday');
  await expect(node(page, 'buttons')).toHaveAttribute('data-parent', 'someday');
  for (let i = 0; i < 4; i++) {
    await settle(page, 10);
    await expect(node(page, 'buttons')).toHaveAttribute(
      'data-parent',
      'someday'
    );
  }
  await page.mouse.up();
  await expect(node(page, 'buttons')).toHaveAttribute('data-parent', 'someday');
  await expect(page.locator('[data-board-node]')).toHaveCount(18);
});

test('a collection moves with its children, then cancellation restores the entire tree', async ({
  page,
}) => {
  await pickUp(page, 'Components');
  await moveInside(page, 'launch');
  await expect(node(page, 'components')).toHaveAttribute(
    'data-parent',
    'launch'
  );
  await expect(node(page, 'buttons')).toHaveAttribute(
    'data-parent',
    'components'
  );
  await expect(node(page, 'inputs')).toHaveAttribute(
    'data-parent',
    'components'
  );
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(node(page, 'components')).toHaveAttribute(
    'data-parent',
    'system'
  );
  await expect(page.locator('[data-board-node]')).toHaveCount(18);
});

test('root collections reorder and cannot move into their own descendants', async ({
  page,
}) => {
  await pickUp(page, 'Ideas & exploration');
  const target = (await page
    .getByRole('button', {name: 'Drag In the making', exact: true})
    .boundingBox())!;
  await page.mouse.move(target.x, target.y + target.height / 2);
  await settle(page);
  await page.mouse.up();
  await expect
    .poll(() =>
      page
        .locator('[data-board-contents="board"] > [data-board-node]')
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute('data-board-node'))
        )
    )
    .toEqual(['progress', 'ideas', 'ready']);

  await pickUp(page, 'Design system');
  // Its visible placeholder still contains the descendants while it is lifted.
  const child = (await page
    .locator('[data-board-append="contents:components"]')
    .first()
    .boundingBox())!;
  await page.mouse.move(child.x + child.width / 2, child.y + child.height / 2);
  await settle(page);
  await page.mouse.up();
  await expect(node(page, 'system')).toHaveAttribute('data-parent', 'progress');
  await expect(node(page, 'components')).toHaveAttribute(
    'data-parent',
    'system'
  );
  await expect(page.locator('[data-board-node]')).toHaveCount(18);
});

test('keyboard sorting reverses within a nested list and commits on drop', async ({
  page,
}) => {
  await page
    .getByRole('button', {name: 'Drag Give buttons some love', exact: true})
    .focus();
  await page.keyboard.press('Space');
  await expect(page.locator('[data-nested-board]')).toHaveAttribute(
    'data-dragging',
    'true'
  );
  const children = page.locator(
    '[data-board-contents="contents:components"] > [data-board-node]:not([aria-hidden="true"])'
  );
  const order = () =>
    children.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-board-node'))
    );
  await page.keyboard.press('ArrowDown');
  await expect.poll(order).toEqual(['inputs', 'buttons']);
  await page.keyboard.press('ArrowUp');
  await expect.poll(order).toEqual(['buttons', 'inputs']);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');
  await expect(page.locator('[data-nested-board]')).toHaveAttribute(
    'data-dragging',
    'false'
  );
  await expect.poll(order).toEqual(['inputs', 'buttons']);
});

test('a group reorders across a sibling card in both keyboard directions', async ({
  page,
}) => {
  await page
    .getByRole('button', {name: 'Drag Components', exact: true})
    .focus();
  await page.keyboard.press('Space');
  await expect(page.locator('[data-nested-board]')).toHaveAttribute(
    'data-dragging',
    'true'
  );
  const order = () =>
    page
      .locator(
        '[data-board-contents="contents:system"] > [data-board-node]:not([aria-hidden="true"])'
      )
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('data-board-node'))
      );
  await page.keyboard.press('ArrowUp');
  await expect.poll(order).toEqual(['components', 'tokens']);
  await page.keyboard.press('ArrowDown');
  await expect.poll(order).toEqual(['tokens', 'components']);
  await page.keyboard.press('Space');
  await expect(page.locator('[data-nested-board]')).toHaveAttribute(
    'data-dragging',
    'false'
  );
  await expect(node(page, 'buttons')).toHaveAttribute(
    'data-parent',
    'components'
  );
  await expect(node(page, 'inputs')).toHaveAttribute(
    'data-parent',
    'components'
  );
});

test('a card reorders across a sibling group in both keyboard directions', async ({
  page,
}) => {
  await page
    .getByRole('button', {name: 'Drag Make color feel consistent', exact: true})
    .focus();
  await page.keyboard.press('Space');
  await expect(page.locator('[data-nested-board]')).toHaveAttribute(
    'data-dragging',
    'true'
  );
  const order = () =>
    page
      .locator(
        '[data-board-contents="contents:system"] > [data-board-node]:not([aria-hidden="true"])'
      )
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('data-board-node'))
      );
  await page.keyboard.press('ArrowDown');
  await expect.poll(order).toEqual(['components', 'tokens']);
  await page.keyboard.press('ArrowUp');
  await expect.poll(order).toEqual(['tokens', 'components']);
  await page.keyboard.press('Space');
  await expect(page.locator('[data-nested-board]')).toHaveAttribute(
    'data-dragging',
    'false'
  );
  await expect(node(page, 'buttons')).toHaveAttribute(
    'data-parent',
    'components'
  );
  await expect(node(page, 'inputs')).toHaveAttribute(
    'data-parent',
    'components'
  );
});

test('a group moves above and below a sibling card with the pointer', async ({
  page,
}) => {
  await pickUp(page, 'Components');
  const order = () =>
    page
      .locator(
        '[data-board-contents="contents:system"] > [data-board-node]:not([aria-hidden="true"])'
      )
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('data-board-node'))
      );
  for (const expected of [
    ['components', 'tokens'],
    ['tokens', 'components'],
  ]) {
    const rect = (await node(page, 'tokens').boundingBox())!;
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2, {
      steps: 16,
    });
    await settle(page, 20);
    await expect.poll(order).toEqual(expected);
  }
  await page.mouse.up();
  await expect(page.locator('[data-board-node]')).toHaveCount(18);
  await expect(node(page, 'buttons')).toHaveAttribute(
    'data-parent',
    'components'
  );
  await expect(node(page, 'inputs')).toHaveAttribute(
    'data-parent',
    'components'
  );
});

test('a card can move to the root and reset restores the original arrangement', async ({
  page,
}) => {
  await pickUp(page, 'Find a fresh direction');
  const target = page.locator('[data-board-append="board"]');
  await target.scrollIntoViewIfNeeded();
  const rect = (await target.boundingBox())!;
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await settle(page);
  await page.mouse.up();
  await expect(node(page, 'moodboard')).toHaveAttribute('data-parent', 'board');
  await page.getByRole('button', {name: 'Reset board'}).click();
  await expect(node(page, 'moodboard')).toHaveAttribute(
    'data-parent',
    'website'
  );
  await expect(page.locator('[data-board-node]')).toHaveCount(18);
});

test('the board fits a narrow screen without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({width: 390, height: 844});
  await expect(node(page, 'ideas')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390
  );
  await page.getByRole('button', {name: 'Reset board'}).click();
});

test('copy trace retains the starting layout, input, collisions, geometry, and final placement', async ({
  page,
}) => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset.copiedTrace = text;
        },
      },
    });
  });
  await pickUp(page, 'Give buttons some love');
  await moveInside(page, 'someday');
  await page.mouse.up();
  await settle(page);
  await page.getByRole('button', {name: 'Copy trace', exact: true}).click();
  await expect(page.getByRole('status', {name: 'Trace export'})).toContainText(
    'Copied'
  );
  const trace = await page.evaluate(() =>
    JSON.parse(document.documentElement.dataset.copiedTrace!)
  );
  expect(trace.schema).toBe('dnd-kit/nested-collections-trace@1');
  expect(trace.initial.source).toBe('buttons');
  expect(
    trace.initial.tree.find((node: {id: string}) => node.id === 'buttons')
      .parent
  ).toBe('components');
  expect(trace.ending.event).toBe('dragend');
  expect(trace.active).toBe(false);
  expect(trace.ending.sourceLocation.parent).toBe('someday');
  expect(
    trace.events.some((entry: {event: string}) => entry.event === 'dragmove')
  ).toBe(true);
  expect(
    trace.events.some(
      (entry: {event: string; collisions?: unknown[]}) =>
        entry.event === 'collision' && entry.collisions?.length
    )
  ).toBe(true);
  expect(
    trace.events.some(
      (entry: {event: string; droppables?: {dom: unknown; shape: unknown}[]}) =>
        entry.event === 'frame' &&
        entry.droppables?.some((drop) => drop.dom && drop.shape)
    )
  ).toBe(true);
  expect(trace.omittedEvents).toBe(0);
  await page.getByRole('button', {name: 'Dismiss', exact: true}).click();
  await page.getByRole('button', {name: 'Reset board'}).click();
  await settle(page, 20);
  expect(
    await page.evaluate(
      () => window.__nestedCollectionsTrace!.snapshot().totalEvents
    )
  ).toBe(trace.totalEvents);
});

test('a blocked clipboard exposes selectable JSON and preserves a canceled drag', async ({
  page,
}) => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException('Blocked', 'NotAllowedError');
        },
      },
    });
  });
  await pickUp(page, 'Components');
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await page.getByRole('button', {name: 'Copy trace', exact: true}).click();
  const field = page.getByRole('textbox', {name: 'Drag trace JSON'});
  await expect(field).toBeVisible();
  const trace = JSON.parse(await field.inputValue());
  expect(trace.ending.canceled).toBe(true);
  expect(trace.initial.source).toBe('components');
  // Drag feedback prevents text selection until its drop cleanup finishes.
  await expect(node(page, 'components')).toHaveAttribute(
    'data-source',
    'false'
  );
  await field.click();
  expect(
    await field.evaluate(
      (element: HTMLTextAreaElement) =>
        element.selectionEnd - element.selectionStart
    )
  ).toBe((await field.inputValue()).length);
});

test('picking up a nested collection keeps it in its current parent', async ({
  page,
}) => {
  await pickUp(page, 'Components');
  await settle(page);
  await expect(node(page, 'components')).toHaveAttribute(
    'data-parent',
    'system'
  );
  await page.keyboard.press('Escape');
  await page.mouse.up();
});

for (const {name, path, source, placements, finalParent} of [
  {
    name: 'root slots',
    path: pointerPath,
    source: 'components',
    finalParent: 'progress',
    placements: [
      ['progress', 2],
      ['ideas', 3],
      ['website', 2],
      ['ideas', 3],
      ['progress', 2],
      ['progress', 1],
    ],
  },
  {
    name: 'cloned collection headers',
    path: headerPath,
    source: 'components',
    finalParent: 'ideas',
    placements: [
      ['system', 0],
      ['progress', 2],
      ['ideas', 3],
      ['website', 2],
      ['website', 0],
      ['ideas', 1],
      ['board', 1],
      ['ideas', 3],
      ['ideas', 0],
    ],
  },
  {
    name: 'resizing nested containers',
    path: containerPath,
    source: 'website',
    finalParent: 'ideas',
    // The pointer stays in its own group's background. That no longer
    // appends the source, so Someday never shifts underneath the pointer.
    placements: [],
  },
]) {
  test.describe(`reported pointer path: ${name}`, () => {
    test.use({
      viewport: path.viewport,
      deviceScaleFactor: path.viewport.devicePixelRatio,
    });

    test('small pointer movements do not repeat layout-driven placements', async ({
      page,
    }) => {
      await page.evaluate(() => document.fonts.ready);
      await page.mouse.move(path.start.x, path.start.y);
      await page.mouse.down();
      await page.mouse.move(path.start.x + 6, path.start.y);
      await expect(page.locator('[data-nested-board]')).toHaveAttribute(
        'data-dragging',
        'true'
      );
      for (const [x, y, pauseFrames] of path.moves) {
        if (pauseFrames) await settle(page, pauseFrames);
        await page.mouse.move(x, y);
        await settle(page, 1);
      }
      await page.mouse.up();
      await expect(page.locator('[data-nested-board]')).toHaveAttribute(
        'data-dragging',
        'false'
      );
      const result = await page.evaluate((source) => {
        const trace = window.__nestedCollectionsTrace!.snapshot();
        return {
          omitted: trace.omittedEvents,
          placements: trace.events
            .filter((entry) => entry.event === 'dragover')
            .map(
              (entry) =>
                entry.placement as {
                  changed: boolean;
                  to: {parent: string; index: number};
                }
            )
            .filter((placement) => placement.changed)
            .map(({to}) => [to.parent, to.index]),
          sourceTargets: trace.events
            .filter((entry) => entry.event === 'frame')
            .flatMap((entry) =>
              (
                entry.droppables as {
                  id: string;
                  connected: boolean;
                  shape: {width: number; height: number} | null;
                }[]
              ).filter((target) => target.id === source)
            ),
        };
      }, source);
      expect(result.omitted).toBe(0);
      expect(result.placements).toEqual(placements);
      expect(result.sourceTargets.length).toBeGreaterThan(0);
      for (const target of result.sourceTargets) {
        expect(target.connected).toBe(true);
        expect(target.shape?.width).toBeGreaterThan(0);
        expect(target.shape?.height).toBeGreaterThan(0);
      }
      await expect(node(page, source)).toHaveAttribute(
        'data-parent',
        finalParent
      );
      await expect(page.locator('[data-board-node]')).toHaveCount(18);
    });
  });
}
