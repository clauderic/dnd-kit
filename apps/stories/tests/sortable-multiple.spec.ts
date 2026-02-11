import {test, expect} from '../../stories-shared/tests/fixtures.ts';

test.describe('Sortable multiple lists', () => {
  const columnItems = (dnd: any, id: string) =>
    dnd.page.locator(`#storybook-root ul#${id}`).locator('.Item, .item');

  test.beforeEach(async ({dnd}) => {
    await dnd.goto('react-sortable-multiple-lists--example');
    await expect(dnd.items.first()).toBeVisible();
  });

  test('reorder items within a list with pointer', async ({dnd}) => {
    const columnA = columnItems(dnd, 'A');
    const first = columnA.nth(0);
    const third = columnA.nth(2);

    const firstText = await first.textContent();

    await dnd.pointer.drag(first, third);
    await dnd.waitForDrop();

    const newFirst = await columnA.nth(0).textContent();
    expect(newFirst).not.toBe(firstText);
  });

  test('move item from column A to column B with pointer', async ({dnd}) => {
    const columnA = columnItems(dnd, 'A');
    const columnB = columnItems(dnd, 'B');

    const countA = await columnA.count();
    const countB = await columnB.count();
    const firstA = columnA.nth(0);
    const firstB = columnB.nth(0);

    await dnd.pointer.drag(firstA, firstB);
    await dnd.waitForDrop();

    const newCountA = await columnA.count();
    const newCountB = await columnB.count();

    expect(newCountA).toBe(countA - 1);
    expect(newCountB).toBe(countB + 1);
  });

  test('move item from column A to empty column D with pointer', async ({
    dnd,
  }) => {
    const columnA = columnItems(dnd, 'A');
    const columnD = dnd.page.locator('#storybook-root ul#D');

    const countA = await columnA.count();
    const firstA = columnA.nth(0);
    const columnDBox = await columnD.boundingBox();

    // Drag into the empty column D area
    const box = await firstA.boundingBox();
    await dnd.page.mouse.move(
      box!.x + box!.width / 2,
      box!.y + box!.height / 2
    );
    await dnd.page.mouse.down();
    await dnd.page.mouse.move(
      columnDBox!.x + columnDBox!.width / 2,
      columnDBox!.y + columnDBox!.height / 2,
      {steps: 30}
    );
    await dnd.page.mouse.up();
    await dnd.waitForDrop();

    const newCountA = await columnA.count();
    const countD = await columnItems(dnd, 'D').count();

    expect(newCountA).toBe(countA - 1);
    expect(countD).toBe(1);
  });

  test('cancel drag restores original order', async ({dnd}) => {
    const columnA = columnItems(dnd, 'A');
    const originalTexts = await columnA.allTextContents();

    const firstHandle = dnd.handles.nth(0);

    await dnd.keyboard.pickup(firstHandle);
    await dnd.keyboard.move('down', 2);
    await dnd.keyboard.cancel();
    await dnd.waitForDrop();

    const textsAfter = await columnA.allTextContents();
    expect(textsAfter).toEqual(originalTexts);
  });
});
