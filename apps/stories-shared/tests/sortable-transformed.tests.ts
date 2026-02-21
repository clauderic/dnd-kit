import {test, expect} from './fixtures.ts';

interface SortableTransformedStories {
  withOverlay: string;
  withoutOverlay: string;
}

export function sortableTransformedTests(stories: SortableTransformedStories) {
  for (const [label, storyId, usesOverlay] of [
    ['with overlay', stories.withOverlay, true],
    ['without overlay', stories.withoutOverlay, false],
  ] as const) {
    test.describe(`Sortable with CSS transforms (${label})`, () => {
      test.beforeEach(async ({dnd}) => {
        await dnd.goto(storyId);
        await expect(dnd.items.first()).toBeVisible();
      });

      test('dragged element appears at correct position for transform-positioned item', async ({
        dnd,
      }) => {
        // Target the 3rd item (index 2) which has a non-trivial
        // transform: translateY(124px). If the Feedback plugin doesn't
        // account for the CSS transform, the dragged element will appear
        // offset by that amount.
        const item = dnd.items.nth(2);
        await expect(item).toBeVisible();

        const box = await item.boundingBox();
        if (!box) throw new Error('Could not get bounding box');

        const clickX = box.x + box.width / 2;
        const clickY = box.y + box.height / 2;

        await dnd.page.mouse.move(clickX, clickY);
        await dnd.page.mouse.down();

        await dnd.page.mouse.move(clickX, clickY + 60, {steps: 15});
        await expect(dnd.dragging).toHaveCount(1, {timeout: 3_000});

        const draggingBox = await dnd.dragging.boundingBox();
        if (!draggingBox)
          throw new Error('Could not get dragging bounding box');

        // The cursor should still be at approximately the center of the
        // dragged element relative to its width/height.
        const cursorRelativeX = clickX - draggingBox.x;
        const cursorRelativeY = clickY + 60 - draggingBox.y;

        const expectedRelativeX = box.width / 2;
        const expectedRelativeY = box.height / 2;

        const tolerance = 10;

        expect(
          Math.abs(cursorRelativeX - expectedRelativeX),
          `Dragged element X offset from cursor is wrong by ${Math.abs(cursorRelativeX - expectedRelativeX)}px`
        ).toBeLessThan(tolerance);
        expect(
          Math.abs(cursorRelativeY - expectedRelativeY),
          `Dragged element Y offset from cursor is wrong by ${Math.abs(cursorRelativeY - expectedRelativeY)}px. ` +
            `This likely means the CSS transform offset was not compensated.`
        ).toBeLessThan(tolerance);

        await dnd.page.mouse.up();
        await dnd.waitForDrop();
      });

      test('dragged element tracks pointer accurately for transform-positioned items', async ({
        dnd,
      }) => {
        const item = dnd.items.nth(3);
        await expect(item).toBeVisible();

        const box = await item.boundingBox();
        if (!box) throw new Error('Could not get bounding box');

        const clickX = box.x + box.width / 2;
        const clickY = box.y + box.height / 2;

        await dnd.page.mouse.move(clickX, clickY);
        await dnd.page.mouse.down();

        const firstMoveX = clickX;
        const firstMoveY = clickY + 60;
        await dnd.page.mouse.move(firstMoveX, firstMoveY, {steps: 15});
        await expect(dnd.dragging).toHaveCount(1, {timeout: 3_000});

        // Record initial offset between cursor and dragged element
        const initialBox = await dnd.dragging.boundingBox();
        if (!initialBox)
          throw new Error('Could not get initial dragging bounding box');

        const initialOffsetX = firstMoveX - initialBox.x;
        const initialOffsetY = firstMoveY - initialBox.y;

        // Move to several positions and verify the offset stays consistent
        const positions = [
          {x: clickX + 50, y: clickY + 120},
          {x: clickX - 30, y: clickY + 200},
          {x: clickX + 100, y: clickY + 80},
        ];

        const tolerance = 5;

        for (const pos of positions) {
          await dnd.page.mouse.move(pos.x, pos.y, {steps: 5});
          await dnd.page.waitForTimeout(50);

          const movedBox = await dnd.dragging.boundingBox();
          if (!movedBox)
            throw new Error('Could not get dragging bounding box during move');

          const movedOffsetX = pos.x - movedBox.x;
          const movedOffsetY = pos.y - movedBox.y;

          expect(
            Math.abs(movedOffsetX - initialOffsetX),
            `X offset drifted by ${Math.abs(movedOffsetX - initialOffsetX)}px`
          ).toBeLessThan(tolerance);
          expect(
            Math.abs(movedOffsetY - initialOffsetY),
            `Y offset drifted by ${Math.abs(movedOffsetY - initialOffsetY)}px`
          ).toBeLessThan(tolerance);
        }

        await dnd.page.mouse.up();
        await dnd.waitForDrop();
      });

      test('can reorder transform-positioned items with pointer', async ({
        dnd,
      }) => {
        const first = dnd.items.nth(0);
        const second = dnd.items.nth(1);

        await expect(first).toHaveText('1');
        await expect(second).toHaveText('2');

        await dnd.pointer.drag(first, second);
        await dnd.waitForDrop();

        await expect(dnd.items.nth(0)).toHaveText('2');
        await expect(dnd.items.nth(1)).toHaveText('1');
        await expect(dnd.items.nth(2)).toHaveText('3');
      });
    });
  }
}
