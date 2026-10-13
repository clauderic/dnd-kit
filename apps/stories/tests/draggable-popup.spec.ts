import {test, expect} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.goto(
    '/iframe.html?id=react-draggable-popup--example&viewMode=story'
  );

  await page.getByRole('button', {name: 'Toggle popup'}).click();
  await expect(page.getByTestId('popup')).toBeVisible();
});

test('ordinary outside clicks close the popup', async ({page}) => {
  await page.getByRole('button', {name: 'Outside button'}).click();

  await expect(page.getByTestId('popup')).toHaveCount(0);
});

test('dropping inside the popup keeps it open', async ({page}) => {
  const button = page.getByRole('button', {name: 'Drag me'});
  const box = await button.boundingBox();

  if (!box) throw new Error('Draggable button has no bounding box');

  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 60, y + 20, {steps: 10});

  await expect(page.locator('[data-dnd-dragging]')).toHaveCount(1);

  await page.mouse.up();

  // Confirm that a drag completed, rather than just a click.
  await expect(page.getByTestId('completed-drags')).toHaveText('1');
  await expect(page.getByTestId('popup')).toBeVisible();

  // Genuine outside clicks must still dismiss the popup afterward.
  await page.getByRole('button', {name: 'Outside button'}).click();
  await expect(page.getByTestId('popup')).toHaveCount(0);
});
