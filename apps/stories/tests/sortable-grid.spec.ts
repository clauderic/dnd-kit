import {test, expect} from './fixtures.ts';

test.describe('Sortable grid', () => {
  test.beforeEach(async ({dnd}) => {
    await dnd.goto('react-sortable-grid--grid');
    await expect(dnd.items.first()).toBeVisible();
  });

  test('drag initiates and completes in grid', async ({dnd}) => {
    const first = dnd.items.nth(0);
    const second = dnd.items.nth(1);

    const firstText = await first.textContent();
    const box = await first.boundingBox();
    const targetBox = await second.boundingBox();

    await dnd.page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await dnd.page.mouse.down();
    await dnd.page.mouse.move(
      targetBox!.x + targetBox!.width / 2,
      targetBox!.y + targetBox!.height / 2,
      {steps: 20}
    );

    await expect(dnd.dragging).toHaveCount(1);

    await dnd.page.mouse.up();
    await dnd.waitForDrop();
  });
});
