import {test, expect} from '../../stories-shared/tests/fixtures.ts';

test.describe('Sortable vertical list', () => {
  test.beforeEach(async ({dnd}) => {
    await dnd.goto('sortable-vertical-list--basic-setup');
    await expect(dnd.items.first()).toBeVisible();
  });

  test('reorder items down with pointer', async ({dnd}) => {
    const first = dnd.items.nth(0);
    const third = dnd.items.nth(2);

    await expect(first).toHaveText('0');

    await dnd.pointer.drag(first, third);
    await dnd.waitForDrop();

    await expect(dnd.items.nth(0)).toHaveText('1');
    await expect(dnd.items.nth(1)).toHaveText('2');
    await expect(dnd.items.nth(2)).toHaveText('0');
  });

  test('reorder items up with pointer', async ({dnd}) => {
    const third = dnd.items.nth(2);
    const first = dnd.items.nth(0);

    await dnd.pointer.drag(third, first);
    await dnd.waitForDrop();

    await expect(dnd.items.nth(0)).toHaveText('2');
    await expect(dnd.items.nth(1)).toHaveText('0');
    await expect(dnd.items.nth(2)).toHaveText('1');
  });

  test('reorder items with keyboard', async ({dnd}) => {
    const first = dnd.items.nth(0);

    await dnd.keyboard.pickup(first);
    await dnd.keyboard.move('down', 2);
    await dnd.keyboard.drop();
    await dnd.waitForDrop();

    await expect(dnd.items.nth(0)).toHaveText('1');
    await expect(dnd.items.nth(1)).toHaveText('2');
    await expect(dnd.items.nth(2)).toHaveText('0');
  });

  test('cancel keyboard drag restores order', async ({dnd}) => {
    const first = dnd.items.nth(0);

    await dnd.keyboard.pickup(first);
    await dnd.keyboard.move('down', 3);
    await dnd.keyboard.cancel();
    await dnd.waitForDrop();

    await expect(dnd.items.nth(0)).toHaveText('0');
    await expect(dnd.items.nth(1)).toHaveText('1');
    await expect(dnd.items.nth(2)).toHaveText('2');
    await expect(dnd.items.nth(3)).toHaveText('3');
  });
});
