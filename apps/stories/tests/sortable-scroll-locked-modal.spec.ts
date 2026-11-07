import {test, expect} from '../../stories-shared/tests/fixtures.ts';

test('keyboard sorting reaches the adjacent visible row in a scrolled, scroll-locked modal', async ({
  dnd,
  page,
}) => {
  await dnd.goto('react-sortable-vertical-list--scroll-locked-modal');
  await expect(page.getByRole('button', {name: 'Open modal'})).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(500);
  await page.getByRole('button', {name: 'Open modal'}).click();

  const dialog = page.getByRole('dialog', {name: 'Sortable modal'});
  const items = dialog.locator('.Item');
  await expect(items).toHaveCount(2);
  await expect(items.nth(0)).toBeInViewport();
  await expect(items.nth(1)).toBeInViewport();

  // Both visible rows lie beyond the body's obsolete keyboard clipping edge.
  expect(
    await items.first().evaluate((item) => {
      const body = document.body.getBoundingClientRect();
      return item.getBoundingClientRect().top > body.bottom + body.height * 0.2;
    })
  ).toBe(true);
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

  await dnd.keyboard.pickup(items.nth(1).locator('button'));
  await dnd.keyboard.move('up');
  await dnd.keyboard.drop();
  await dnd.waitForDrop();

  await expect(items.nth(0)).toHaveText('2');
  await expect(items.nth(1)).toHaveText('1');
});
