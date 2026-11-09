import {test, expect} from '../../stories-shared/tests/fixtures.ts';

const STORY_ID = 'react-sortable-scaled--basic-setup';

test.describe('Sortable inside a scaled ancestor', () => {
  test.beforeEach(async ({dnd}) => {
    await dnd.goto(STORY_ID);
    await expect(dnd.items.first()).toBeVisible();
  });

  // https://github.com/clauderic/dnd-kit/issues/2041
  test('sorting animations start where the item was, without overshooting', async ({
    dnd,
  }) => {
    const {page} = dnd;
    const source = dnd.items.nth(0);
    const sibling = dnd.items.nth(1);

    const sourceBox = await source.boundingBox();
    const siblingBox = await sibling.boundingBox();
    if (!sourceBox || !siblingBox)
      throw new Error('Could not get bounding boxes');

    // Drag the first item down over the second one, so the second item
    // animates from its old slot into the first slot
    await page.mouse.move(
      sourceBox.x + sourceBox.width / 2,
      sourceBox.y + sourceBox.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      siblingBox.x + siblingBox.width / 2,
      siblingBox.y + siblingBox.height * 0.75,
      {steps: 20}
    );
    await expect(dnd.dragging).toHaveCount(1);

    // Wait for the sibling's sorting animation, then pause it on its first frame
    const startTop = await page.waitForFunction(() => {
      const items = Array.from(
        document.querySelectorAll<HTMLElement>('#storybook-root .Item')
      );
      const item = items.find((element) => element.textContent?.trim() === '2');
      const animation = item
        ?.getAnimations()
        .find((animation) => animation.playState === 'running');

      if (!item || !animation) return null;

      animation.pause();
      animation.currentTime = 0;

      return item.getBoundingClientRect().top;
    });

    // The animation must start at the item's previous on-screen position
    expect(Math.abs((await startTop.jsonValue())! - siblingBox.y)).toBeLessThan(
      2
    );

    await page.mouse.up();
    await dnd.waitForDrop();
  });
});
