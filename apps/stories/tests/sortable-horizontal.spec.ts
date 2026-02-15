import {test, expect} from '../../stories-shared/tests/fixtures.ts';

test.describe('Sortable horizontal list', () => {
  test.beforeEach(async ({dnd}) => {
    await dnd.goto('react-sortable-horizontal-list--horizontal');
    await expect(dnd.items.first()).toBeVisible();
  });

  test('reorder items right with pointer', async ({dnd}) => {
    const first = dnd.items.nth(0);
    const third = dnd.items.nth(2);

    await dnd.pointer.drag(first, third);
    await dnd.waitForDrop();

    await expect(dnd.items.nth(0)).toHaveText('2');
    await expect(dnd.items.nth(1)).toHaveText('3');
    await expect(dnd.items.nth(2)).toHaveText('1');
  });

  test('reorder items with keyboard', async ({dnd}) => {
    const first = dnd.items.nth(0);

    await dnd.keyboard.pickup(first);
    await dnd.keyboard.move('right', 2);
    await dnd.keyboard.drop();
    await dnd.waitForDrop();

    await expect(dnd.items.nth(0)).toHaveText('2');
    await expect(dnd.items.nth(1)).toHaveText('3');
    await expect(dnd.items.nth(2)).toHaveText('1');
  });
});
