import {test, expect} from '../../stories-shared/tests/fixtures.ts';

const STORY_ID = 'react-sortable-margins--basic-setup';

test.describe('Sortable items with margins', () => {
  test.beforeEach(async ({dnd}) => {
    await dnd.goto(STORY_ID);
    await expect(dnd.page.locator('.margin-item').first()).toBeVisible();
  });

  for (const [name, index] of [
    ['inline margin', 0],
    ['stylesheet margin', 1],
  ] as const) {
    test(`dragged element stays under the pointer with ${name}`, async ({
      dnd,
    }) => {
      const item = dnd.page.locator('.margin-item').nth(index);
      const box = await item.boundingBox();
      if (!box) throw new Error('Could not get bounding box');

      // Grab the item 1/4 from its top-left corner
      const grabX = box.x + box.width * 0.25;
      const grabY = box.y + box.height * 0.25;

      await dnd.page.mouse.move(grabX, grabY);
      await dnd.page.mouse.down();

      const targetX = grabX + 10;
      const targetY = grabY + 80;
      await dnd.page.mouse.move(targetX, targetY, {steps: 15});
      await expect(dnd.dragging).toHaveCount(1, {timeout: 3_000});

      const draggingBox = await dnd.dragging.boundingBox();
      if (!draggingBox) throw new Error('Could not get dragging bounding box');

      // The pointer must stay at the same spot within the item, so the
      // margin must not shift the dragged element away from the pointer
      const tolerance = 3;
      expect(Math.abs(targetX - draggingBox.x - box.width * 0.25)).toBeLessThan(
        tolerance
      );
      expect(
        Math.abs(targetY - draggingBox.y - box.height * 0.25)
      ).toBeLessThan(tolerance);

      await dnd.page.mouse.up();
      await dnd.waitForDrop();
    });
  }
});
