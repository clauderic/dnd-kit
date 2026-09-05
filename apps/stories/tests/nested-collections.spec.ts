import {test, expect, type Page} from '@playwright/test';

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
