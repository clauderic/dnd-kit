import {test, expect} from '../../stories-shared/tests/fixtures.ts';

test.describe('Sortable inside a scaled parent', () => {
  test('items do not oscillate while sorting', async ({dnd}) => {
    await dnd.goto('react-sortable--scaled-parent');

    const list = dnd.page.locator('.scaled-list[data-scale="2"]');
    const items = list.locator('.scaled-item');
    const source = items.filter({hasText: 'scale-2-C'}).first();
    const target = items.filter({hasText: 'scale-2-E'});
    const sourceBox = await source.boundingBox();
    const targetBox = await target.boundingBox();

    if (!sourceBox || !targetBox) {
      throw new Error('Could not get sortable item bounds');
    }

    const start = {
      x: sourceBox.x + sourceBox.width / 2,
      y: sourceBox.y + sourceBox.height / 2,
    };
    const end = {
      x: targetBox.x + targetBox.width / 2,
      y: targetBox.y + targetBox.height / 2,
    };

    await dnd.page.mouse.move(start.x, start.y);
    await dnd.page.mouse.down();

    const indices: number[] = [];

    for (let step = 1; step <= 24; step++) {
      const progress = step / 24;

      await dnd.page.mouse.move(
        start.x + (end.x - start.x) * progress,
        start.y + (end.y - start.y) * progress
      );
      await dnd.page.waitForTimeout(40);

      const order = await list
        .locator('.scaled-item:not([data-dnd-placeholder])')
        .allTextContents();
      const index = order.map((value) => value.trim()).indexOf('scale-2-C');

      if (index >= 0 && indices.at(-1) !== index) {
        indices.push(index);
      }
    }

    await expect(dnd.dragging).toHaveCount(1);
    expect(indices).toEqual([2, 3, 4]);

    await dnd.page.mouse.up();
    await dnd.waitForDrop();
  });
});
