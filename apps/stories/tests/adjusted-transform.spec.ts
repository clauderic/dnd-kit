import type {Locator, Page} from '@playwright/test';

import {test, expect} from '../../stories-shared/tests/fixtures.ts';

const EXAMPLE = 'react-draggable-adjusted-transform--example';
const NESTED = 'react-draggable-adjusted-transform--nested-scrollables';

const HUD = {
  transform: 'hud-value-transform',
  scrollAdjustment: 'hud-value-scrollAdjustment',
  adjustedTransform: 'hud-value-adjustedTransform',
} as const;

async function readHud(page: Page, testid: string) {
  const text = (await page.getByTestId(testid).textContent()) ?? '';
  const [x, y] = text.split(',').map((value) => Number(value.trim()));
  return {x, y};
}

async function drag(
  page: Page,
  button: Locator,
  dragging: Locator,
  dx = 60,
  dy = 80
) {
  const box = await button.boundingBox();
  if (!box) throw new Error('Could not get button bounding box');

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const cursor = {x: startX + dx, y: startY + dy};

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(cursor.x, cursor.y, {steps: 15});
  await expect(dragging).toHaveCount(1, {timeout: 3_000});

  return {cursor};
}

async function expectUnderCursor(
  dragging: Locator,
  cursor: {x: number; y: number},
  tolerance = 5
) {
  const box = await dragging.boundingBox();
  if (!box) throw new Error('Could not get dragging bounding box');
  expect(Math.abs(cursor.x - (box.x + box.width / 2))).toBeLessThan(tolerance);
  expect(Math.abs(cursor.y - (box.y + box.height / 2))).toBeLessThan(tolerance);
}

test.describe('Adjusted transform', () => {
  test('translates by transform when nothing scrolls', async ({dnd}) => {
    await dnd.goto(EXAMPLE);
    const button = dnd.buttons.first();
    await expect(button).toBeVisible();
    await dnd.disableTransitions();

    const {cursor} = await drag(dnd.page, button, dnd.dragging);

    await expectUnderCursor(dnd.dragging, cursor);

    expect(await readHud(dnd.page, HUD.scrollAdjustment)).toEqual({x: 0, y: 0});
    expect(await readHud(dnd.page, HUD.adjustedTransform)).toEqual(
      await readHud(dnd.page, HUD.transform)
    );

    await dnd.page.mouse.up();
    await dnd.waitForDrop();
  });

  test('compensates for scrolling the container mid-drag', async ({dnd}) => {
    await dnd.goto(EXAMPLE);
    const button = dnd.buttons.first();
    await expect(button).toBeVisible();
    await dnd.disableTransitions();

    const {cursor} = await drag(dnd.page, button, dnd.dragging);

    await dnd.page.mouse.wheel(0, 150);

    await expect
      .poll(async () => (await readHud(dnd.page, HUD.scrollAdjustment)).y, {
        timeout: 3_000,
      })
      .not.toBe(0);

    await expectUnderCursor(dnd.dragging, cursor);

    await dnd.page.mouse.up();
    await dnd.waitForDrop();
  });

  test('accumulates nested scroll offsets (window + outer + inner)', async ({
    dnd,
  }) => {
    await dnd.goto(NESTED);
    const button = dnd.buttons.first();
    await expect(button).toBeVisible();
    await dnd.disableTransitions();

    const {cursor} = await drag(dnd.page, button, dnd.dragging);

    await dnd.page
      .getByTestId('inner-scrollable')
      .evaluate((el) => el.scrollBy(0, 40));
    await dnd.page
      .getByTestId('outer-scrollable')
      .evaluate((el) => el.scrollBy(0, 60));
    await dnd.page.evaluate(() => window.scrollBy(0, 50));

    await expect
      .poll(async () => (await readHud(dnd.page, HUD.scrollAdjustment)).y, {
        timeout: 3_000,
      })
      .toBeGreaterThanOrEqual(140);

    await expectUnderCursor(dnd.dragging, cursor);

    await dnd.page.mouse.up();
    await dnd.waitForDrop();
  });
});
