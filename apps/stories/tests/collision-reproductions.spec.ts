import {test, expect, type Page, type TestInfo} from '@playwright/test';
import {mkdir, writeFile} from 'node:fs/promises';
import type {} from '../stories/react/Sortable/CollisionReproductions/CollisionReproductions';

test.use({viewport: {width: 1440, height: 1100}});
test.setTimeout(30_000);

// Pacing for observation only: allow React, animation and position measurements
// to settle after each real pointer event. This adds no collision policy. Tests
// assert per-input outcomes, not elapsed milliseconds or a throughput benchmark.
async function settle(page: Page, frames = 12) {
  await page.evaluate(async (frames) => {
    for (let frame = 0; frame < frames; frame++)
      await new Promise(requestAnimationFrame);
  }, frames);
}

async function startCard(page: Page, story: string, id: string) {
  await page.goto(
    `/iframe.html?id=react-sortable-collision-reproductions--${story}&viewMode=story`
  );
  const card = page.locator(`[data-card="${id}"]`);
  await card.waitFor();
  const rect = (await card.boundingBox())!;
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width / 2 + 6, rect.y + rect.height / 2);
  await page.waitForFunction(
    () => window.__collisionRepro?.manager.dragOperation.status.dragging
  );
  return rect;
}

async function attach(page: Page, info: TestInfo, observations: unknown) {
  const samples = await page.evaluate(() => window.__collisionRepro?.samples);
  await saveEvidence(info, 'collision-evidence.json', {
    project: info.project.name,
    observations,
    samples,
  });
}

async function saveEvidence(info: TestInfo, name: string, evidence: unknown) {
  await mkdir(info.outputDir, {recursive: true});
  const path = info.outputPath(name);
  await writeFile(path, JSON.stringify(evidence, null, 2));
  await info.attach(name, {contentType: 'application/json', path});
}

test('auto-height columns remain stable during 1px jitter', async ({
  page,
}, info) => {
  await startCard(page, 'kanban', '3');
  const a = (await page.locator('[data-column="A"]').boundingBox())!;
  const point = {x: a.x + 231, y: a.y + 50};
  const targets: (string | number | null)[] = [];
  for (let i = 0; i < 20; i++) {
    await page.mouse.move(point.x, point.y + (i % 2));
    await settle(page);
    targets.push(
      await page.evaluate(() => window.__collisionRepro!.snapshot().target)
    );
  }
  await attach(page, info, {point, targets});
  const changes = targets.slice(1).filter((id, i) => id !== targets[i]).length;
  expect(changes).toBe(0);
  const before = await page.evaluate(
    () =>
      window.__collisionRepro!.samples.filter(({event}) => event === 'over')
        .length
  );
  await settle(page, 20);
  expect(
    await page.evaluate(
      () =>
        window.__collisionRepro!.samples.filter(({event}) => event === 'over')
          .length
    )
  ).toBe(before);
  await page.mouse.up();
});

test('gap affinity follows a subpixel reversal across the column boundary', async ({
  page,
}, info) => {
  await startCard(page, 'kanban', '3');
  const a = (await page.locator('[data-column="A"]').boundingBox())!;
  const targets = [];
  for (const x of [231, 232, 234, 235.75, 236.25, 236.5, 236.25, 235.75]) {
    await page.mouse.move(a.x + x, a.y + 50);
    await settle(page);
    targets.push(
      await page.evaluate(() => window.__collisionRepro!.snapshot().target)
    );
  }
  await attach(page, info, targets);
  expect(targets).toEqual(['A', 'A', 'A', 'A', 'B', 'B', 'B', 'A']);
  await page.mouse.up();
});

test('scrolling updates a stationary pointer target in the scroll event turn', async ({
  page,
}, info) => {
  await startCard(page, 'stationary-scroll', 'drag');
  const box = (await page.locator('[data-scroll-region]').boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await settle(page);
  const before = await page.evaluate(() => window.__collisionRepro!.snapshot());
  expect(before.target).toBe('A');
  const after = await page.evaluate(async () => {
    const region = document.querySelector('[data-scroll-region]')!;
    const scrolled = new Promise<void>((resolve) =>
      region.addEventListener('scroll', () => resolve(), {once: true})
    );
    region.scrollTop = 160;
    await scrolled;
    // Drain the observer/notifier microtasks in this event turn. No frame wait,
    // timeout, or subsequent pointer input is needed to obtain the new target.
    for (let i = 0; i < 8; i++) await Promise.resolve();
    return window.__collisionRepro!.snapshot();
  });
  await attach(page, info, {before, after});
  expect(after.point).toEqual(before.point);
  expect(after.target).toBe('B');
  await page.mouse.up();
});

test('CONTROL: item targets stabilize the same Kanban gap position', async ({
  page,
}, info) => {
  await startCard(page, 'sortable-kanban', '3');
  const a = (await page.locator('[data-column="A"]').boundingBox())!;
  const targets = [];
  for (let i = 0; i < 10; i++) {
    await page.mouse.move(a.x + 231, a.y + 50 + (i % 2));
    await settle(page);
    targets.push(
      await page.evaluate(() => window.__collisionRepro!.snapshot().target)
    );
  }
  await attach(page, info, targets);
  expect(new Set(targets.slice(3))).toEqual(new Set(['3']));
  await page.mouse.up();
});

test('the first 3px reverse input reorders a vertical sortable list', async ({
  page,
}, info) => {
  const rect = await startCard(page, 'vertical-reversal', '1');
  const observations = [];
  for (const offset of [65, 66, 63, 62, 60, 57, 55]) {
    await page.mouse.move(rect.x + rect.width / 2, rect.y + offset);
    await settle(page);
    observations.push(
      await page.evaluate(() => {
        const {manager} = window.__collisionRepro!;
        const source = manager.dragOperation.source as unknown as {
          sortable: {index: number};
        };
        return {
          index: source.sortable.index,
          point: {...manager.dragOperation.position.current},
          raw: manager.collisionObserver.computeCollisions()[0]?.id,
        };
      })
    );
  }
  await attach(page, info, observations);
  expect(observations.slice(0, 2).map(({index}) => index)).toEqual([1, 1]);
  expect(observations[2].index).toBe(0);
  expect(observations[6].index).toBe(0);
  await page.mouse.up();
});

test('repeated 2px reversals need no intervening same-direction input', async ({
  page,
}, info) => {
  const rect = await startCard(page, 'vertical-reversal', '1');
  const indices = [];
  for (const offset of [65, 63, 65, 63, 65, 63]) {
    await page.mouse.move(rect.x + rect.width / 2, rect.y + offset);
    await settle(page);
    indices.push(
      await page.evaluate(
        () =>
          (
            window.__collisionRepro!.manager.dragOperation
              .source as unknown as {sortable: {index: number}}
          ).sortable.index
      )
    );
  }
  await attach(page, info, indices);
  expect(indices).toEqual([1, 0, 1, 0, 1, 0]);
  await page.mouse.up();
});

test('keyboard commands accepted during rendering finish before an immediate drop', async ({
  page,
}, info) => {
  await page.goto(
    '/iframe.html?id=react-sortable-collision-reproductions--vertical-reversal&viewMode=story'
  );
  await page.locator('[data-card="1"]').focus();
  await page.keyboard.press('Space');
  await page.waitForFunction(
    () => window.__collisionRepro?.manager.dragOperation.status.dragging
  );
  await settle(page);
  await page.evaluate(() => {
    const {manager} = window.__collisionRepro!;
    const renderer = manager.renderer;
    let release!: () => void;
    const rendering = new Promise<void>((resolve) => {
      release = resolve;
    });
    manager.renderer = {rendering};
    Object.assign(window, {
      __releaseCollisionRender: () => {
        manager.renderer = renderer;
        release();
      },
    });
  });
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');
  await page.evaluate(() =>
    (
      window as unknown as {__releaseCollisionRender(): void}
    ).__releaseCollisionRender()
  );
  await page.waitForFunction(
    () => window.__collisionRepro!.manager.dragOperation.status.idle
  );
  await attach(page, info, await page.locator('[data-card]').allTextContents());
  await expect(page.locator('[data-column="list"] [data-card]')).toHaveText([
    '2',
    '3',
    '4',
    '1',
  ]);
});

type NestedEvent = {
  sequence: number;
  event: string;
  source: string | null;
  target: string | null;
  coordinates: {x: number; y: number};
  reason?: string;
  ownDescendant: boolean;
  shapes: {current: {width: number; height: number} | null};
  collisions: {id: string; ownDescendant: boolean}[];
};

async function nestedTrace(page: Page): Promise<NestedEvent[]> {
  return page.evaluate(
    () =>
      (
        window as unknown as {
          __nestedCollisionTrace: {events: NestedEvent[]};
        }
      ).__nestedCollisionTrace.events
  );
}

async function nestedReplay(
  page: Page,
  story: string,
  source: string,
  target: string
) {
  await page.goto(
    `/iframe.html?id=react-sortable-collision-reproductions-nested--${story}&viewMode=story`
  );
  const handle = page.locator(`[data-nested-handle="${source}"]`).first();
  await handle.waitFor();
  const from = (await handle.boundingBox())!;
  const selector = target.startsWith('item:')
    ? 'data-nested-node'
    : 'data-nested-append';
  const to = (await page
    .locator(`[${selector}="${target}"]`)
    .first()
    .boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 8, from.y + from.height / 2);
  await expect
    .poll(async () =>
      (await nestedTrace(page)).some(({event}) => event === 'dragstart')
    )
    .toBe(true);
  const point = {x: to.x + to.width / 2, y: to.y + to.height * 0.75};
  await page.mouse.move(point.x, point.y, {steps: 5});
  await settle(page);
  const start = (await nestedTrace(page)).length;
  for (let i = 0; i < 8; i++) {
    await page.mouse.move(point.x, point.y + (i % 2));
    await settle(page);
  }
  return {point, start, events: await nestedTrace(page)};
}

async function attachNested(info: TestInfo, result: unknown) {
  await saveEvidence(info, 'nested-collision-evidence.json', result);
}

for (const offset of [320, 338]) {
  test(`Puck root item stays placed at moving container edge ${offset}`, async ({
    page,
  }, info) => {
    await page.goto(
      '/iframe.html?id=react-sortable-collision-reproductions-nested--puck-nested-grid&viewMode=story'
    );
    const handle = page.locator('[data-nested-handle="item:1"]').first();
    await handle.waitFor();
    const source = (await page
      .locator('[data-nested-node="item:1"]')
      .first()
      .boundingBox())!;
    const from = (await handle.boundingBox())!;
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      from.x + from.width / 2 + 8,
      from.y + from.height / 2
    );
    await settle(page, 2);
    const point = {x: source.x + offset, y: source.y + 211};
    await page.mouse.move(point.x, point.y, {steps: 12});
    await settle(page, 30);
    const before = (await nestedTrace(page)).at(-1)!.sequence;
    await settle(page, 40);
    const events = await nestedTrace(page);
    await attachNested(info, {point, before, events});
    expect(
      events.filter(
        ({event, sequence}) => event === 'dragover' && sequence > before
      )
    ).toHaveLength(0);
    await page.keyboard.press('Escape');
  });
}

test('nested/root transfers remain stable when visual feedback resizes', async ({
  page,
}, info) => {
  const result = await nestedReplay(
    page,
    'nested-lists-root-transfer',
    'item:A1.2',
    'root:canvas'
  );
  await attachNested(info, result);
  const changes = result.events
    .slice(result.start)
    .filter(({event}) => event === 'dragover');
  expect(changes).toHaveLength(0);
  await page.mouse.up();
});

test('dragging a container excludes its own descendants', async ({
  page,
}, info) => {
  const result = await nestedReplay(
    page,
    'own-descendant-exclusion',
    'container:A',
    'item:A1.2'
  );
  await attachNested(info, result);
  expect(
    result.events.some(
      ({event, ownDescendant}) => event === 'dragover' && ownDescendant
    )
  ).toBe(false);
  expect(
    result.events.some(
      ({event, collisions}) =>
        event === 'collision' &&
        collisions.some(({ownDescendant}) => ownDescendant)
    )
  ).toBe(false);
  await page.mouse.up();
});

for (const scenario of [
  {
    story: 'puck-nested-grid',
    source: 'item:3a',
    target: 'item:2',
    sizes: ['274x180', '320x180'],
  },
  {
    story: 'variable-size-nested-grid',
    source: 'item:2',
    target: 'children:container:3',
    sizes: ['320x260', '274x156'],
  },
]) {
  test(`CONTROL: ${scenario.story} exercises a changing drag footprint`, async ({
    page,
  }, info) => {
    // Keep the tall variant away from the viewport's auto-scroll activation edge.
    await page.setViewportSize({width: 1440, height: 1500});
    const result = await nestedReplay(
      page,
      scenario.story,
      scenario.source,
      scenario.target
    );
    await attachNested(info, result);
    const sizes = new Set(
      result.events
        .filter(
          ({source, shapes}) => source === scenario.source && shapes.current
        )
        .map(
          ({shapes}) =>
            `${Math.round(shapes.current!.width)}x${Math.round(shapes.current!.height)}`
        )
    );
    for (const size of scenario.sizes) expect(sizes.has(size)).toBe(true);
    // These are resizing controls, not claims of endless oscillation in every
    // nested layout. The nested-list test above proves the repeating cycle.
    await page.mouse.up();
  });
}
