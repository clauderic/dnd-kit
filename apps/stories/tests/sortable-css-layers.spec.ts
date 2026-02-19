import {test, expect} from '../../stories-shared/tests/fixtures.ts';

const STORY_ID = 'react-sortable-css-layers--basic-setup';

test.describe('Sortable with CSS @layer styles', () => {
  test.beforeEach(async ({dnd}) => {
    await dnd.goto(STORY_ID);
    await expect(dnd.items.first()).toBeVisible();
  });

  test('layered styles are preserved during drag', async ({dnd}) => {
    const first = dnd.items.nth(0);
    const third = dnd.items.nth(2);

    await expect(first).toHaveCSS('background-color', 'rgb(232, 240, 254)');
    await expect(first).toHaveCSS('border-color', 'rgb(76, 159, 254)');

    const sourceBox = await first.boundingBox();
    const targetBox = await third.boundingBox();

    await dnd.page.mouse.move(
      sourceBox!.x + sourceBox!.width / 2,
      sourceBox!.y + sourceBox!.height / 2
    );
    await dnd.page.mouse.down();
    await dnd.page.mouse.move(
      targetBox!.x + targetBox!.width / 2,
      targetBox!.y + targetBox!.height / 2,
      {steps: 10}
    );

    await expect(dnd.dragging).toHaveCount(1);

    const draggingEl = dnd.dragging.first();

    await expect(draggingEl).toHaveCSS(
      'background-color',
      'rgb(232, 240, 254)'
    );
    await expect(draggingEl).toHaveCSS('border-color', 'rgb(76, 159, 254)');
    await expect(draggingEl).toHaveCSS('color', 'rgb(26, 58, 92)');
    await expect(draggingEl).toHaveCSS('padding', '12px 20px');
    await expect(draggingEl).toHaveCSS('border-radius', '8px');

    await dnd.page.mouse.up();
    await dnd.waitForDrop();
  });
});
