import {test, expect} from '../../stories-shared/tests/fixtures.ts';

test.describe('Sortable reactive state', () => {
  for (const input of ['pointer', 'keyboard'] as const) {
    test(`subscribes to state first read after mounting (${input})`, async ({
      dnd,
      page,
    }) => {
      await dnd.goto('react-sortable--conditional-state');

      const item = page.getByRole('button', {name: 'Item 1', exact: true});
      const status = page.getByRole('status', {name: 'Drag state for item 1'});

      await expect(item).toBeVisible();
      await expect(status).toHaveCount(0);
      await page.getByRole('checkbox', {name: 'Show drag state'}).check();
      await expect(status).toHaveText('Idle');

      if (input === 'keyboard') {
        await dnd.keyboard.pickup(item);
      } else {
        const box = await item.boundingBox();
        if (!box) throw new Error('Could not get the sortable item bounds');

        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x + 30, y + 30, {steps: 10});
        await expect(dnd.dragging).toHaveCount(1);
      }

      await expect(status).toHaveText('Dragging');

      if (input === 'keyboard') {
        await dnd.keyboard.drop();
      } else {
        await page.mouse.up();
      }

      await dnd.waitForDrop();
      await expect(status).toHaveText('Idle');
    });
  }

  test('updates state read on the first render', async ({dnd, page}) => {
    await page.goto(
      '/iframe.html?id=react-sortable--conditional-state&viewMode=story&args=initiallyShowState:true'
    );

    const item = page.getByRole('button', {name: 'Item 1', exact: true});
    const status = page.getByRole('status', {name: 'Drag state for item 1'});

    await expect(status).toHaveText('Idle');
    await dnd.keyboard.pickup(item);
    await expect(status).toHaveText('Dragging');
    await dnd.keyboard.cancel();
    await dnd.waitForDrop();
    await expect(status).toHaveText('Idle');
  });
});
